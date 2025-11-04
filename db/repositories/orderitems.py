from models import OrderItems
from repositories.base import BaseRepository
from sqlalchemy.orm import Session


class OrderItemsRepository(BaseRepository[OrderItems]):
    def __init__(self, session: Session):
        super().__init__(OrderItems, session)