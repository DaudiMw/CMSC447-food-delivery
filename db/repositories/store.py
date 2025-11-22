from typing import Optional
from sqlalchemy.orm import Session
from models import Item, Store, User
from repositories.base import BaseRepository
from api.schemas.store_schemas import StoreWithItemsSchema
from sqlalchemy.orm import joinedload



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
    
    def get_user_stores(self, user_id: str) -> list[Store]:
        """Get all stores that a user owns."""
        return self.session.query(Store).filter(
            self.model.owners.any(User.id == user_id),
            self.model.is_deleted == False
        ).all()
    
    def check_store_owner(self, user_id: str, store_id: int) -> list[Store]:
        """Get a store's owners."""
        return self.session.query(Store).filter(
            self.model.id == store_id,
            self.model.owners.any(User.id == user_id),
            self.model.is_deleted == False,
        ).all()
    
    def get_store_with_items(self, store_id: int):
        """Get a single store and all its related items."""
        
        store = self.session.query(Store).options(
            joinedload(Store.items).joinedload(Item.item_info),
            joinedload(Store.address),  # Add this line
            joinedload(Store.hours)
        ).filter(
            Store.id == store_id,
            Store.is_deleted == False
        ).first()
        
        if not store:
            return None
        
        # Filter items in Python
        store.items = [
            item for item in store.items 
            if not item.is_deleted and (not item.item_info or not item.item_info.is_deleted)
        ]
        
        return store