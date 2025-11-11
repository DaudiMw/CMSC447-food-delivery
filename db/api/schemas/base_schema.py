from pydantic import BaseModel

class BaseSchema(BaseModel):
    is_deleted: bool = False
    class Config:
        from_attributes = True



        # orm_mode = True

class Address(BaseModel):
    street: str
    city: str
    state: str
    zip: str
    
    class Config:
        from_attributes = True

class MediaSchema(BaseModel):
    media_id: str
    filename: str

