
from pydantic import BaseModel
from api.schemas.base_schema import BaseSchema, Address
from datetime import datetime, time
from typing import List, Optional
from api.schemas.store_schemas import StoreInfoSchema
from models import OrderStatus
from api.schemas.item_schemas import ItemSchema
from api.schemas.user_schemas import UserSummary

class OrderItemSchema(BaseSchema):
    id: int
    item: ItemSchema
    quantity: int

class OrderSchema(BaseSchema):
    id: int
    user_id: str
    dasher_id: Optional[str] = None
    store_id: int
    address_id: int
    address: Address
    status: str
    created_at: datetime
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    updated_at: datetime
    items: List[OrderItemSchema]
    user: UserSummary
    store: StoreInfoSchema
    dasher: Optional[UserSummary] = None
    earnings: Optional[float] = None


class OrderStatusUpdateSchema(BaseModel):
    status: str

class OrderShow(BaseSchema):
    id: int
    address: Address
    status: str
    created_at: datetime
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    updated_at: datetime
    items: list[OrderItemSchema]
    store: StoreInfoSchema

class OrderUpdateSchema(BaseSchema):
    status: str
    dasher_id: str
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


