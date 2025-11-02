from pydantic import BaseModel
from api.schemas.base_schema import BaseSchema

class ReportSchema(BaseSchema):
    report_id: str
    user_id: str
    order_id: str
    store_id: str
    dasher_id: str
    comment: str