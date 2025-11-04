


from pydantic import BaseModel


class BaseSchema(BaseModel):
    is_deleted: bool = False

    class Config:
        from_attributes = True
        # orm_mode = True

class Address(BaseModel):
    user_id: str | None = None
    label: str | None = None
    street: str
    city: str
    state: str
    zip: str