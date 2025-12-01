
from pydantic import BaseModel
from datetime import datetime, time
from typing import List, Optional
from api.schemas.base_schema import BaseSchema, Address
from api.schemas.item_schemas import ItemSchema


class OrderSchema(BaseSchema):
    id: int
    user_id: str
    dasher_id: Optional[str] = None
    store_id: int
    address: str
    status: str
    created_at: datetime
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    updated_at: datetime
    items: list["ItemSchema"]


class OrderShow(BaseSchema):
    address: Address
    status: str
    created_at: str
    accepted_at: str
    completed_at: str
    updated_at: str
    items: list["ItemSchema"]

class OrderUpdateSchema(BaseSchema):
    status: str
    dasher_id: str
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None



