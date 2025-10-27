from datetime import datetime
from typing import Optional
from api.schemas.base_schema import BaseSchema
from api.schemas.order_schemas import OrderSchema
from api.schemas.item_schemas import ItemSchema, ItemSchemaWithInfo


class StoreSchema(BaseSchema):
    store_id: str
    name: str
    address: str
    phone: str | None = None
    # created_at: datetime | None = None


class StoreCreate(BaseSchema):
    name: str
    address: str
    phone: Optional[str] = None

class StoreWithItemsSchema(StoreSchema):
    name: str
    address: str
    phone: str | None = None
    created_at: datetime | None = None
    items: list[ItemSchemaWithInfo] = []

