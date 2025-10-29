
from pydantic import BaseModel
from api.schemas.base_schema import BaseSchema
from api.schemas.item_schemas import ItemSchema


class OrderSchema(BaseSchema):
    order_id: str
    user_id: str
    store_id: str
    address: str
    status: str
    created_at: str
    updated_at: str
    items: list["ItemSchema"]


class OrderShow(BaseSchema):
    address: str
    status: str
    created_at: str
    updated_at: str
    items: list["ItemSchema"]



