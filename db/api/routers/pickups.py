from api.schemas.user_schemas import UserAuth
from repositories.pickups import PickUpsRepository
from repositories.orders import OrderRepository
from repositories.store import StoreRepository
from repositories.user import UserRepository
from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import get_current_user, dasher_required
from sqlalchemy.orm import Session
from database import get_db
from models import UserRole
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.pickup_schemas import PickUpSchema, PickUpCreateSchema, PickUpCompleteSchema

router = APIRouter(prefix="/pickups", tags=["pickups"], dependencies=[Depends(dasher_required), Depends(oauth2_scheme)])
user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("/{order_id}", status_code=201, response_model=list[PickUpSchema])
async def create_pickup_to_order(pickup: PickUpCreateSchema,
                                 user: user_dependency,
                                 db: Session = Depends(get_db)):
    """Creates a report for an order."""
    """Perms: admin, user of order, dasher of order"""
    reports_repo = PickUpsRepository(db)
    orders_repo = OrderRepository(db)
    stores_repo = StoreRepository(db)
    users_repo = UserRepository(db)
    store = stores_repo.get_by_id(pickup.store_id)
    order = orders_repo.get_by_id(pickup.order_id)
    user = users_repo.get_by_id(pickup.dasher_id)

    if user.role != UserRole.admin and order.user_id != user.id and order.pickups.dasher_id != user.id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    try:
        new_report = reports_repo.create(**(pickup.dict()), order=order, store=store, user=user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return new_report

@router.get("/{user_id}", response_model=list[PickUpSchema])
async def get_dashers_pickups(user_id: str, 
                              user: user_dependency,
                              db : Session = Depends(get_db)):
    """Get all of a dashers currently picked up items"""
          
    if user.role == UserRole.user or user.role == UserRole.store_owner or (user.role == UserRole.dasher and user_id != user.id):
        raise HTTPException(status_code=401, detail="You do not have permissions to access this.")
    
    pickup_repo = PickUpsRepository(db)

    pickups = pickup_repo.get_by_dasher_id(user_id)

    return pickups

@router.patch("/{pickup_id}/{order_id}/status", status_code=200)
async def change_order_status(pickup_id: int, order_id: int,
                              token = Annotated[str, Depends(oauth2_scheme)]):
    """Edit the status of a picked up order."""

    






