from pydantic import BaseModel

class BaseSchema(BaseModel):
    is_deleted: bool = False
    class Config:
        from_attributes = True



        # orm_mode = True

class Address(BaseModel):
    id: int | None = None
    label: str | None = None
    street: str
    city: str
    state: str
    zip: str
    
    class Config:
        from_attributes = True

class MediaSchema(BaseModel):
    media_id: int
    filename: str

