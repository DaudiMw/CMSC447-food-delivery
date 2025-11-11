from datetime import datetime
from typing import List, Optional
from api.schemas.base_schema import BaseSchema, MediaSchema
from api.schemas.order_schemas import OrderSchema
from api.schemas.item_schemas import ItemSchema, ItemSchemaWithInfo
from api.schemas.base_schema import Address

class StoreHoursSchema(BaseSchema):
    day: str
    start_time: str | None = None
    end_time: str | None = None

class StoreSchema(BaseSchema):
    name: str
    description: str | None = None
    picture: MediaSchema | None = None
    address: Address
    phone: str | None = None
    created_at: datetime | None = None
    hours: list[StoreHoursSchema] = []

class StoreResponseSchema(BaseSchema):
    name: str
    description: str | None = None
    picture: MediaSchema | None = None
    address: Address
    phone: str | None = None
    created_at: datetime | None = None

class StoreInfoSchema(BaseSchema):
    store_id: str
    name: str
    description: str | None = None
    phone: str
    created_at: datetime
    logo_id: Optional[str]
    banner_id: Optional[str]
    address: Address

class StoreCreateSchema(BaseSchema):
    name: str
    description: str | None = None
    phone: str | None = None
    hours: list[StoreHoursSchema]
    

class StoreWithItemsSchema(BaseSchema):
    store_id: str
    name: str
    description: Optional[str]
    phone: Optional[str]
    address_id: str
    address: Address
    banner_id: Optional[str]
    logo_id: Optional[str]
    hours: List[StoreHoursSchema]
    items: List[ItemSchema]
    
    # class Config:
    #     from_attributes = True  # This is needed to convert SQLAlchemy models

