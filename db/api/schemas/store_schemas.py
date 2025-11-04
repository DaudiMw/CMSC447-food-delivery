from datetime import datetime
from typing import Optional
from api.schemas.base_schema import BaseSchema
from api.schemas.order_schemas import OrderSchema
from api.schemas.item_schemas import ItemSchema, ItemSchemaWithInfo
from api.schemas.base_schema import Address


class StoreSchema(BaseSchema):
    store_id: str
    name: str
    description: str | None = None
    picture: str | None = None
    address: Address
    phone: str | None = None
    # created_at: datetime | None = None


class StoreWithItemsSchema(StoreSchema):
    items: list[ItemSchemaWithInfo] = []

