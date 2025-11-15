from typing import Generic, TypeVar, Type, List, Optional, Any
from sqlalchemy import inspect
from sqlalchemy.orm import Session

# Define a type variable for the model
ModelType = TypeVar("ModelType", bound=Any)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, id) -> Optional[ModelType]:
        """Retrieve a record by its primary key, ensuring it's not soft-deleted."""
        # Get the primary key column name dynamically
        primary_key_column = inspect(self.model).primary_key[0]
        
        return self.session.query(self.model).filter(
            self.model.is_deleted == False,
            primary_key_column == id
        ).first()
    
    
    def update_by_id(self, id, **kwargs) -> Optional[ModelType]:
        """Update a record by primary key, safely handling soft delete."""

        primary_key_column = inspect(self.model).primary_key[0]

        query = self.session.query(self.model).filter(primary_key_column == id)

        # Add soft-delete filter only if the column exists
        if hasattr(self.model, "is_deleted"):
            query = query.filter(self.model.is_deleted == False)

        obj = query.first()
        if not obj:
            return None

        # Apply updates
        for key, value in kwargs.items():
            if hasattr(obj, key):
                setattr(obj, key, value)

        self.commit()
        self.session.refresh(obj)
        return obj
    

    def get_by_multiple_ids(self, ids: List[str]) -> List[ModelType]:
        """Retrieve multiple records by their primary keys, ensuring they're not soft-deleted."""
        primary_key_column = inspect(self.model).primary_key[0]
        return self.session.query(self.model).filter(
            self.model.is_deleted == False,
            primary_key_column.in_(ids)
        ).all()

    def get_all(self) -> List[ModelType]:
        """Retrieve all records that are not soft-deleted."""
        return self.session.query(self.model).filter(self.model.is_deleted == False).all()
        
    def create(self, **kwargs) -> ModelType:
        """Create a new record."""
        obj = self.model(**kwargs)
        self.session.add(obj)
        self.commit()
        self.session.refresh(obj)
        return obj

    def update(self, obj: ModelType, **kwargs) -> ModelType:
        """Update an existing record."""
        for key, value in kwargs.items():
            setattr(obj, key, value)
        self.commit()
        self.session.flush()
        return obj

    def delete(self, primary_key: str) -> None:
        """Soft-delete an existing record."""
        primary_key_column = inspect(self.model).primary_key[0]
        self.session.query(self.model).filter(primary_key_column == primary_key).update({"is_deleted": True})
        self.commit()


    def hard_delete(self, primary_key: str) -> None:
        """Hard-delete an existing record."""
        primary_key_column = inspect(self.model).primary_key[0]
        self.session.query(self.model).filter(primary_key_column == primary_key).delete()
        self.commit()

    def commit(self) -> None:
        """Commit the changes to the database."""
        self.session.commit()

    def rollback(self) -> None:
        """Rollback the changes to the database."""
        self.session.rollback()

    def flush(self) -> None:
        """Flush the changes to the database."""
        self.session.flush()