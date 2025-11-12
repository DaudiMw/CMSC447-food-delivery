


from api.schemas.base_schema import BaseSchema


class PickUpSchema(BaseSchema):
    pickup_id: int
    order_id: int
    dasher_id: str
    store_id: int
    scheduled_at: str
    completed_at: str