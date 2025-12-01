from typing import Optional, List
from sqlalchemy.orm import Session
from models import Item, ItemType, ItemInfo
from repositories.base import BaseRepository


class ItemRepository(BaseRepository[Item]):
    def __init__(self, session: Session):
        super().__init__(Item, session)

    def create_with_info(self, item_data: dict, info_data: dict = None) -> Item:
        """Create an item and its nutritional info."""
        new_item = Item(**item_data)
        if info_data:
            new_item_info = ItemInfo(**info_data)
            new_item.item_info = new_item_info
        
        self.session.add(new_item)
        self.commit()
        self.session.refresh(new_item)
        return new_item

    def create_with_info_no_commit(self, item_data: dict, info_data: dict = None) -> Item:
        """Create an item and its nutritional info without committing."""
        new_item = Item(**item_data)
        if info_data:
            new_item_info = ItemInfo(**info_data)
            new_item.item_info = new_item_info
        
        self.session.add(new_item)
        self.session.flush()
        self.session.refresh(new_item)
        return new_item

    def update_with_info(self, item: Item, item_data: dict, info_data: dict = None) -> Item:
        """Update an item and its nutritional info without committing."""
        for key, value in item_data.items():
            if hasattr(item, key):
                setattr(item, key, value)

        if info_data:
            if item.item_info:
                for key, value in info_data.items():
                    if hasattr(item.item_info, key):
                        setattr(item.item_info, key, value)
            else:
                item.item_info = ItemInfo(**info_data)
        
        self.session.flush()
        return item


    def get_by_name(self, name: str) -> Optional[Item]:
        """Get an item by its name."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.name == name
        ).one_or_none()
    
    def get_by_store_id(self, store_id: int) -> List[Item]:
        """Get all items for a given store ID."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.store_id == store_id
        ).all()

    def get_by_store_id_and_name(self, store_id: int, name: str) -> Optional[Item]:
        """Get an item by store ID and item name."""
        return self.session.query(Item).filter(
            self.model.is_deleted == False,
            self.model.store_id == store_id,
            self.model.name == name
        ).one_or_none()
    
    def get_by_order_id(self, order_id: int) -> List[Item]:
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
    
    def search_items_by_store(self, store_id: int, query: str) -> List[Item]:
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
    

