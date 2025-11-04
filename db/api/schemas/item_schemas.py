from typing import Optional
from pydantic import BaseModel
from api.schemas.base_schema import BaseSchema

class ItemSchema(BaseSchema):
    item_id: str
    name: str
    item_type: str
    description: str | None = None
    price: float
    picture: str | None = None
    store_id: str
    info_id: str | None = None

class ItemInfoSchema(BaseSchema):
    item_info_id: str
    serving_size: str | None = None
    calories: int
    total_fat: str | None = None
    cholesterol: str | None = None
    sodium: str | None = None
    carbs: str | None = None
    dietary_fiber: str | None = None
    total_sugars: str | None = None
    added_sugars: str | None = None
    protein: str | None = None
    ingredients: str | None = None

class ItemSchemaWithInfo(ItemSchema):
    nutrition_info: Optional[ItemInfoSchema] = None


class ItemCreateSchema(BaseSchema):
    name: str
    item_type: str
    description: str | None = None
    price: float
    picture: str | None = None
    store_id: str
    info_id: str | None = None
