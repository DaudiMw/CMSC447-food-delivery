from sqlalchemy.orm import Session, joinedload
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
    
    def get_by_user_id_and_order_id(self, user_id: str, order_id: int) -> list[Order]:
        """Get all orders for a given user ID and order ID."""
        return self.session.query(Order).filter(
            self.model.is_deleted == False,
            self.model.user_id == user_id,
            self.model.id == order_id
        ).all()
    
    def get_by_dasher_id(self, dasher_id: str) -> list[Order]:
        """Get all orders for a given dasher ID."""
        return self.session.query(Order).filter(
            self.model.is_deleted == False,
            self.model.dasher_id == dasher_id
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

    def get_by_user_id_and_status(self, user_id: str, status: str) -> Order:
        """Get an order for a given user ID and status."""
        return self.session.query(Order).filter(
            self.model.is_deleted == False,
            self.model.user_id == user_id,
            self.model.status == status
        ).first()
    
    def get_by_store_id(self, store_id: int) -> list[Order]:
        """Get all orders for a given store ID."""
        return self.session.query(Order).filter(
            self.model.is_deleted == False,
            self.model.store_id == store_id
        ).all()
    
    def get_all_deliveries(self) -> list[Order]:
        """Get all orders that have been assigned to a dasher."""
        return self.session.query(Order).filter(
            self.model.is_deleted == False,
            self.model.dasher_id != None
        ).options(joinedload(Order.user), joinedload(Order.items)).all()
    

    


    

        

    
    

    


    

        