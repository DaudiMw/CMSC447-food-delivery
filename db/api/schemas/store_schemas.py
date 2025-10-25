from typing import Optional
from api.schemas.base_schema import BaseSchema

class StoreSchema(BaseSchema):
    store_id: str
    name: str
    address: str
    phone: str
    created_at: str