from models import DasherApplications
from repositories.base import BaseRepository
from sqlalchemy.orm import Session, joinedload


class ApplicationRepository(BaseRepository[DasherApplications]):
    def __init__(self, session: Session):
        super().__init__(DasherApplications, session)
    

    def get_by_user_id(self, user_id: str) -> DasherApplications:
        """Get a dasher application by user ID."""
        return self.session.query(DasherApplications).filter(
            self.model.is_deleted == False,
            self.model.user_id == user_id
        ).first()
    
    def get_all_applications(self) -> list[DasherApplications]:
        """Get all dasher applications."""
        return self.session.query(DasherApplications).filter(
            self.model.is_deleted == False
        ).all()
    
    def get_all_with_user(self) -> list[DasherApplications]:
        """Get all dasher applications with user data."""
        return self.session.query(DasherApplications).options(joinedload(DasherApplications.user)).all()
    
    def delete_by_user_id(self, user_id: str) -> bool:
        """Soft delete a dasher application by user ID."""
        application = self.session.query(DasherApplications).filter(
            self.model.is_deleted == False,
            self.model.user_id == user_id
        ).first()
        if application:
            application.is_deleted = True
            self.commit()
            return True
        return False
    
    def create_application(self, user_id: str, content: str) -> DasherApplications | None:
        """Create a new dasher application."""
        new_application = DasherApplications(user_id=user_id, content=content)
        try:
            self.session.query(DasherApplications).filter(
                self.model.is_deleted == False,
                self.model.user_id == user_id
            ).one()
            # If we reach here, an application already exists
            return None
        except:
            pass  # No existing application found, proceed to create

        self.session.add(new_application)
        self.commit()
        self.session.refresh(new_application)

        return new_application

    

