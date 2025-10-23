from sqlalchemy.orm import Session
from models import Order, OrderStatus
from repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self, session: Session):
        super().__init__(Order, session)
    

    def get_by_user_id(self, user_id: str) -> list[Order]:
        """Get all orders for a given user ID."""
        return self.session.query(Order).filter(
            self.model.is_deleted == False,
            self.model.user_id == user_id
        ).all()
    
    def get_by_order_state(self, state: OrderStatus) -> list[Order]:
        """Get all orders for a given order state."""
        return self.session.query(Order).filter(
            self.model.is_deleted == False,
            self.model.status == state
        ).all()
    
    def order_by_date(self) -> list[Order]:
        """Get all orders ordered by date."""
        return self.session.query(Order).filter(
            self.model.is_deleted == False
        ).order_by(Order.created_at).all()
    
    def get_by_user_id_ordered_by_date(self, user_id: str) -> list[Order]:
        """Get all orders for a given user ID ordered by date."""
        return self.session.query(Order).filter(
            self.model.is_deleted == False,
            self.model.user_id == user_id
        ).order_by(Order.created_at).all()
    
    

    


    

        

    
    

    


    

        