from sqlalchemy.orm import Session
from models import Reports
from repositories.base import BaseRepository


class ReportsRepository(BaseRepository[Reports]):
    def __init__(self, session: Session):
        super().__init__(Reports, session)

    def get_by_order_id(self, order_id: int) -> list[Reports]:
        return self.session.query(Reports).filter(
            self.model.order_id == order_id
        ).all()
    
    def get_by_user_id(self, user_id: str) -> list[Reports]:
        return self.session.query(Reports).filter(
            self.model.user_id == user_id
        ).all()
    
    def get_by_store_id(self, store_id: int) -> list[Reports]:
        return self.session.query(Reports).filter(
            self.model.store_id == store_id
        ).all()
    
    def get_by_store_id_and_user_id(self, store_id: int, user_id: str) -> list[Reports]:
        return self.session.query(Reports).filter(
            self.model.store_id == store_id,
            self.model.user_id == user_id
        ).order_by(self.model.date).all()
    
    