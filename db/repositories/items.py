
from typing import Optional, List
from sqlalchemy.orm import Session
from models import Item, ItemType
from base import BaseRepository


class ItemRepository(BaseRepository[Item]):
    def __init__(self, session: Session):
        super().__init__(Item, session)

    def get_by_name(self, name: str) -> Optional[Item]:
        """Get an item by its name."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.name == name
        ).one_or_none()
    
    def get_by_store_id(self, store_id: str) -> List[Item]:
        """Get all items for a given store ID."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.store_id == store_id
        ).all()

    def get_by_store_id_and_name(self, store_id: str, name: str) -> Optional[Item]:
        """Get an item by store ID and item name."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.store_id == store_id,
            self.model.name == name
        ).one_or_none()
    
    def get_by_order_id(self, order_id: str) -> List[Item]:
        """Get all items for a given order ID."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.orders.any(order_id=order_id)
        ).all()
    
    def search_items(self, query: str) -> List[Item]:
        """Search for items by name or description."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            (self.model.name.ilike(f"%{query}%")) |
            (self.model.description.ilike(f"%{query}%"))
        ).all()
    
    def search_items_by_store(self, store_id: str, query: str) -> List[Item]:
        """Search for items by name or description for a specific store."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.store_id == store_id,
            (self.model.name.ilike(f"%{query}%")) |
            (self.model.description.ilike(f"%{query}%"))
        ).all()
    
    def filter_by_itemtype(self, item_type: ItemType) -> List[Item]:
        """Filter items by item type."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.item_type == item_type
        ).all()

    def filter_by_price(self, min_price: float, max_price: float) -> List[Item]:
        """Filter items by price range."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.price >= min_price,
            self.model.price <= max_price
        ).all()
    

    def filter_by_calories(self, min_calories: int, max_calories: int) -> List[Item]:
        """Filter items by calorie range."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.info.calories >= min_calories,
            self.model.info.calories <= max_calories
        ).all()
    

