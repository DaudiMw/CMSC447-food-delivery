from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import oauth2_scheme
from db.api.schemas.order_schemas import OrderSchema
from models import OrderStatus
from db.database import get_db
from sqlalchemy.orm import Session
from api.auth.auth import get_current_user, admin_required
from db.repositories.orders import OrderRepository

router = APIRouter(prefix="orders", tags=["orders"], dependencies=[Depends(oauth2_scheme)])


@router.get("/{order_id}")
async def get_order(order_id: str, token : str = Depends(oauth2_scheme), db : Session = Depends(get_db)):
    """Get an order by its ID."""

    # First make sure that order belongs to the user or they are an admin

    order_repo = OrderRepository(db)

    order = order_repo.get_by_id(order_id)

    if not order or order.is_deleted: 
        raise HTTPException(status_code=404, detail="Order not found")
    
    user = await get_current_user(token)

    if user.user_id != order.user_id and not admin_required(user):
        raise HTTPException(status_code=403, detail="You do not have permission to view this order")
    
    return order

@router.post("/")
async def create_order(order: OrderSchema, token: str = Depends(oauth2_scheme), db : Session = Depends(get_db)):
    """Create a new order."""


    order_repo = OrderRepository(db)

    user = await get_current_user(token)

    order.user_id = user.user_id
    order.created_at = str(datetime.now())
    order.updated_at = str(datetime.now())

    try:
        order_repo.create(**order.dict())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return order


@router.put("/{order_id}", response_model=OrderSchema, status_code=200)
async def update_order(order_id: str, 
                      order: OrderSchema, 
                      token : str = Depends(oauth2_scheme), 
                      db : Session = Depends(get_db)):
    """Update an order by its ID."""

    order_repo = OrderRepository(db)

    user = await get_current_user(token)

    if not (admin_required(user) or user.user_id == order.user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to update this order")
    
    try:
        order_repo.update_by_id(order_id, **order.dict())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return order

@router.delete("/{order_id}", status_code=200)
async def delete_order(order_id: str, token : str = Depends(oauth2_scheme), db : Session = Depends(get_db)):
    """Delete an order by its ID."""

    order_repo = OrderRepository(db)

    order = order_repo.get_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    

    user = await get_current_user(token)

    if not (admin_required(user) or user.user_id == order.user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to delete this order")
    
    try:
        # We will hard-delete orders that have not been paid for yet.
        if order.status == OrderStatus.initialized:
            order_repo.hard_delete(order_id)
        else:
            order_repo.update_by_id(order_id, is_deleted=True)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": "Order deleted successfully"}


