from typing import List
from api.schemas.base_schema import BaseSchema
from api.schemas.item_schemas import ItemSchema

class CartItemBase(BaseSchema):
    item_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseSchema):
    quantity: int

class CartItemSchema(CartItemBase):
    id: int
    item: ItemSchema

class CartBase(BaseSchema):
    pass

class CartSchema(CartBase):
    id: int
    user_id: str
    items: List[CartItemSchema] = []

class CreateOrderFromCartSchema(BaseSchema):
    address_id: int
    store_id: int
