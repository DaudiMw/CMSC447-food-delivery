


from db.api.schemas.base_schema import BaseSchema


class PickUpSchema(BaseSchema):
    pickup_id: str
    order_id: str
    dasher_id: str
    scheduled_at: str
    completed_at: str