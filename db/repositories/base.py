from typing import Generic, TypeVar, Type, List, Optional
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from typing import Any, Dict, Generic, List, TypeVar, Optional
from sqlalchemy.orm import Session
from repository_sqlalchemy.metaclasses import SingletonRepositoryMetaclass
from repository_sqlalchemy.session_management import session_context_var
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from db.database import Base as BaseModel

# Define a type variable for the model
ModelType = TypeVar("ModelType", bound="BaseModel")

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, id: str) -> Optional[ModelType]:
        """Retrieve a record by its primary key, ensuring it's not soft-deleted."""
        # Get the primary key column name dynamically
        primary_key_column = inspect(self.model).primary_key[0]
        
        return self.session.query(self.model).filter(
            self.model.is_deleted == False,
            primary_key_column == id
        ).first()

    def get_all(self) -> List[ModelType]:
        """Retrieve all records that are not soft-deleted."""
        return self.session.query(self.model).filter(self.model.is_deleted == False).all()
        
    def create(self, **kwargs) -> ModelType:
        obj = self.model(**kwargs)
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def update(self, obj: ModelType, **kwargs) -> ModelType:
        for key, value in kwargs.items():
            setattr(obj, key, value)
        self.session.flush()
        return obj

    def delete(self, obj: ModelType) -> None:
        obj.is_deleted = True
        self.session.flush()