from datetime import datetime
from typing import List, Optional
from api.schemas.base_schema import BaseSchema, MediaSchema, Address
from api.schemas.item_schemas import ItemSchema, ItemSchemaWithInfo

class StoreHoursSchema(BaseSchema):
    day: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class StoreInfoSchema(BaseSchema):
    id: int
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    address: Address
    logo_id: Optional[int] = None
    banner_id: Optional[int] = None
    hours: List[StoreHoursSchema] = []

class StoreSchema(StoreInfoSchema):
    created_at: datetime
    items: List[ItemSchema] = []
    
class StoreCreateSchema(BaseSchema):
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    hours: List[StoreHoursSchema] = []

class StoreUpdateSchema(BaseSchema):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[List[StoreHoursSchema]] = None

class StoreWithItemsSchema(StoreInfoSchema):
    items: List[ItemSchemaWithInfo] = []
