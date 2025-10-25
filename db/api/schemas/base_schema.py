


from pydantic import BaseModel


class BaseSchema(BaseModel):
    is_deleted: bool = False

    class Config:
        from_attributes = True
        # orm_mode = True