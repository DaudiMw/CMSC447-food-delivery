from datetime import datetime, time
from typing import List, Optional
from sqlalchemy import BLOB
from api.schemas.base_schema import BaseSchema, Address
from api.schemas.item_schemas import ItemSchema, ItemSchemaWithInfo
from api.schemas.user_schemas import UserSummary

class StoreHoursSchema(BaseSchema):
    day: str
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class StoreInfoSchema(BaseSchema):
    id: int
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    address: Address
    logo_id: Optional[int] = None
    banner_id: Optional[int] = None
    hours: List[StoreHoursSchema] = []
    owners: list[UserSummary] = []

class StoreSchema(StoreInfoSchema):
    items: List[ItemSchema] = []

class StoreCreateSchema(BaseSchema):
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    hours: List[StoreHoursSchema] = []

class StoreFormSchema(BaseSchema):
    store: StoreCreateSchema
    address: Address
    logo: Optional[BLOB]
    banner: Optional[BLOB]

class StoreUpdateSchema(BaseSchema):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[List[StoreHoursSchema]] = None

class StoreWithItemsSchema(StoreInfoSchema):
    items: List[ItemSchemaWithInfo] = []



