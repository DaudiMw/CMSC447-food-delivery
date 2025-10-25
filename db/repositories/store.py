from typing import Optional
from sqlalchemy.orm import Session
from models import Store, StoreOwners
from repositories.base import BaseRepository


class StoreRepository(BaseRepository[Store]):
    def __init__(self, session: Session):
        super().__init__(Store, session)
    

    def get_by_name(self, name: str) -> Optional[Store]:
        """Get a store by its name."""
        return self.session.query(Store).filter(
            self.model.is_deleted == False,
            self.model.name == name
        ).first()
    
    def get_all_ordered(self) -> list[Store]:
        """Get all stores ordered by name."""
        return self.session.query(Store).filter(
            self.model.is_deleted == False
        ).order_by(Store.name).all()
    
    def get_store_by_query(self, query: str) -> list[Store]:
        """Get all stores that match the query."""
        return self.session.query(Store).filter(
            self.model.is_deleted == False,
            self.model.name.ilike(f"%{query}%")
        ).all()
    
    def get_store_ordered_by_time(self) -> list[Store]:
        """Get all stores ordered by time created."""
        return self.session.query(Store).filter(
            self.model.is_deleted == False
        ).order_by(self.model.created_at).all()
    
    def get_store_owner(self, user_id: str, store_id: str) -> list[StoreOwners]:
        """Get store by its owner."""
        return self.session.query(StoreOwners).filter(
            StoreOwners.is_deleted == False,
            StoreOwners.owner_id == user_id,
            StoreOwners.store_id == store_id
        ).all()
    

    
