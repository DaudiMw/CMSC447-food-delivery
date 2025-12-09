from typing import Optional
from pydantic import BaseModel, Field
from api.schemas.base_schema import BaseSchema

class ItemSchema(BaseSchema):
    id: int
    name: str
    item_type: str
    description: str | None = None
    price: float
    store_id: int
    picture_id: Optional[int] = None

class ItemInfoSchema(BaseSchema):
    id: int
    serving_size: str | None = None
    calories: float | None = None
    total_fat: float | None = None
    cholesterol: float | None = None
    sodium: float | None = None
    carbs: str | None = None
    dietary_fiber: str | None = None
    total_sugars: float | None = None
    added_sugars: str | None = None
    protein: float | None = None
    ingredients: str | None = None

class ItemSchemaWithInfo(ItemSchema):
    nutrition_info: Optional[ItemInfoSchema] = Field(None, alias='item_info')
    
    class Config:
        populate_by_name = True  # This allows both 'nutrition_info' and 'item_info' to work


class ItemCreateSchema(BaseSchema):
    name: str
    item_type: str
    description: str | None = None
    price: float
    picture_id: int | None = None


class ItemInfoCreateSchema(BaseModel):
    serving_size: Optional[str] = None
    calories: Optional[float] = None
    total_fat: Optional[float] = None
    cholesterol: Optional[float] = None
    sodium: Optional[float] = None
    carbs: Optional[str] = None
    dietary_fiber: Optional[str] = None
    total_sugars: Optional[float] = None
    added_sugars: Optional[str] = None
    protein: Optional[float] = None
    ingredients: Optional[str] = None

class ItemWithInfoCreateSchema(BaseModel):
    name: str
    item_type: str
    description: Optional[str] = None
    price: float
    nutrition_info: Optional[ItemInfoCreateSchema] = None

class ItemUpdateSchema(BaseModel):
    name: Optional[str] = None
    item_type: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    nutrition_info: Optional[ItemInfoCreateSchema] = None