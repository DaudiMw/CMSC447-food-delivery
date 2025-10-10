from db.repositories.base import BaseRepository
from db.models import User
from sqlalchemy.orm import Session
from typing import Optional, List
from models import UserRole

class UserRepository(BaseRepository[User]):
    def __init__(self, session: Session):
        # The __init__ method is still needed to pass the model and session to the base class.
        super().__init__(User, session)

    def get_by_campus_id(self, campus_id: str) -> Optional[User]:
        """Get a student by their campus id."""
        return self.session.query(User).filter(
            self.model.is_deleted == False,
            User.campus_id == campus_id
            ).one_or_none()
    
    def get_by_user_roles(self, role: UserRole) -> List[User]:
        """Get all users based off of the role"""
        return self.session.query(User).filter(
            self.model.is_deleted == False,
            self.model.role == role
            ).all()
    
    
