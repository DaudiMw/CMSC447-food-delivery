from pydantic import BaseModel
from typing import Optional

class BaseSchema(BaseModel):
    is_deleted: bool = False
    class Config:
        from_attributes = True

class Address(BaseModel):
    id: Optional[int] = None
    street: str
    city: str
    state: str
    zip: str
    building: Optional[str] = None
    room_number: Optional[str] = None
    
    class Config:
        from_attributes = True

class MediaSchema(BaseModel):
    media_id: int
    filename: str

