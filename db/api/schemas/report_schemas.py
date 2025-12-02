from api.schemas.base_schema import BaseSchema
from typing import Optional

class ReportSchema(BaseSchema):
    id: int
    user_id: str
    order_id: int
    store_id: int
    comment: str
    response: Optional[str] = None

class ReportCreateSchema(BaseSchema):
    user_id: str
    order_id: int
    store_id: int
    comment: str

class ReportReplySchema(BaseSchema):
    response: str