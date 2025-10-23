from sqlalchemy.orm import Session
from models import Pickups
from repositories.base import BaseRepository


class PickUpsRepository(BaseRepository[Pickups]):
    def __init__(self, session: Session):
        super().__init__(Pickups, session)

    def get_by_dasher_id(self, dasher_id: str) -> list[Pickups]:
        """Get all pickups for a given dasher ID."""
        return self.session.query(Pickups).filter(
            self.model.is_deleted == False,
            self.model.dasher_id == dasher_id
        ).all()
    
    def get_by_order_id(self, order_id: str) -> list[Pickups]:
        """Get all pickups for a given order ID."""
        return self.session.query(Pickups).filter(
            self.model.is_deleted == False,
            self.model.order_id == order_id
        ).all()
