from typing import Optional
from api.schemas.base_schema import BaseSchema
from api.schemas.order_schemas import OrderSchema
from models import UserRole


class UserSchema(BaseSchema):
    user_id: str
    campus_id: str
    email: str
    password: str
    first_name: str
    last_name: str | None = None
    role: UserRole
    is_banned: bool

class UserCreate(BaseSchema):
    campus_id: str
    email: str
    password: str  # Only needed for creation
    first_name: str
    last_name: Optional[str] = None
    role: UserRole

class UserResponse(BaseSchema):
    user_id: str
    campus_id: str
    email: str
    first_name: str
    last_name: Optional[str] = None
    role: UserRole
    is_banned: bool

class UserSummary(BaseSchema):
    user_id: str
    campus_id: str
    first_name: str
    last_name: Optional[str] = None






