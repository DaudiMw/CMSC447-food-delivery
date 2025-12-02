from typing import Optional
from api.schemas.base_schema import BaseSchema
from models import UserRole
from datetime import datetime


class UserSchema(BaseSchema):
    id: str
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

class UserResponse(BaseSchema):
    id: str
    campus_id: str
    email: str
    first_name: str
    last_name: Optional[str] = None
    role: UserRole
    is_banned: bool

class UserSummary(BaseSchema):
    id: str
    campus_id: str
    first_name: str
    last_name: Optional[str] = None


class UserAuth(BaseSchema):
    email: str
    id: str
    role: UserRole

class ApplicationCreate(BaseSchema):
    id: str
    content: str

class DasherApplicationSchema(BaseSchema):
    id: int
    user_id: str
    content: str
    date_applied: datetime
    user: UserSummary

class UpdateUserRole(BaseSchema):
    user_role: str





