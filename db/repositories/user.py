from .base import BaseRepository
from models import User, UserRole
from sqlalchemy.orm import Session
from typing import Optional, List

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

    def get_by_email(self, email: str) -> Optional[User]:
        """Get a student by their email."""
        return self.session.query(User).filter(
            self.model.is_deleted == False,
            User.email == email
            ).one_or_none()
    
    def get_by_user_roles(self, role: UserRole) -> List[User]:
        """Get all users based off of the role"""
        return self.session.query(User).filter(
            self.model.is_deleted == False,
            self.model.role == role
            ).all()

    def query_by_name_or_campus_id(self, query: str) -> List[User]:
        """Use a query to find a user by name or campus id."""
        return self.session.query(User).filter(
            self.model.is_deleted == False,
            self.model.name.ilike(f"%{query}%") | self.model.campus_id.ilike(f"%{query}%")
        ).all()
    
    def query_by_name_or_campus_id_and_role(self, query: str, role: UserRole) -> List[User]:
        """Use a query to find a user by name or campus id and role."""
        return self.session.query(User).filter(
            self.model.is_deleted == False,
            (self.model.name.ilike(f"%{query}%") | self.model.campus_id.ilike(f"%{query}%")) &
            self.model.role == role
        ).all()
    
    def get_sorted_by_name(self) -> List[User]:
        """Get all users sorted by their first and last name."""
        return self.session.query(User).filter(
            self.model.is_deleted == False
        ).order_by(User.first_name, User.last_name).all()
    
    def update_role(self, user_id: str, new_role: UserRole) -> User:
        """Update a user's role."""
        user = self.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        user.role = new_role
        self.commit()
        self.session.refresh(user)
        return user
    
    def change_ban_status(self, user_id: str, new_status: bool) -> User:
        """Change a user's ban status."""
        user = self.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        user.is_banned = new_status
        self.commit()
        self.session.refresh(user)
        return user
    
    def change_password(self, user_id: str, new_password: str) -> User:
        """Change a user's password."""
        user = self.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        user.password = new_password
        self.commit()
        self.session.refresh(user)
        return user 

     
    
    
