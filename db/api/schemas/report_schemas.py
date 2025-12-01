from api.schemas.base_schema import BaseSchema

class ReportSchema(BaseSchema):
    id: int
    user_id: str
    order_id: int
    store_id: int
    comment: str

class ReportCreateSchema(BaseSchema):
    user_id: str
    order_id: int
    store_id: int
    comment: str

class ReportResponseSchema(BaseSchema):
    response: str