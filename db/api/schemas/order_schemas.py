
from pydantic import BaseModel
from datetime import datetime, time
from typing import List, Optional
from api.schemas.base_schema import BaseSchema
from api.schemas.item_schemas import ItemSchema


class OrderSchema(BaseSchema):
    id: int
    user_id: str
    dasher_id: Optional[str] = None
    store_id: int
    address: str
    status: str
    created_at: time
    accepted_at: Optional[time] = None
    completed_at: Optional[time] = None
    updated_at: time
    items: list["ItemSchema"]


class OrderShow(BaseSchema):
    address: str
    status: str
    created_at: str
    accepted_at: str
    completed_at: str
    updated_at: str
    items: list["ItemSchema"]



