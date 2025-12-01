
from pydantic import BaseModel
from api.schemas.base_schema import BaseSchema, Address
from api.schemas.item_schemas import ItemSchema


class OrderSchema(BaseSchema):
    id: int
    user_id: str
    store_id: int
    address: str
    status: str
    created_at: str
    updated_at: str
    items: list["ItemSchema"]


class OrderShow(BaseSchema):
    address: Address
    status: str
    created_at: str
    updated_at: str
    items: list["ItemSchema"]



