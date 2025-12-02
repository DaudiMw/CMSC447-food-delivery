from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.auth.auth import oauth2_scheme
from api.schemas.order_schemas import OrderSchema, OrderStatusUpdateSchema, OrderUpdateSchema
from api.schemas.cart_schemas import CreateOrderFromCartSchema
from api.schemas.user_schemas import UserAuth
from models import Order, OrderItem, OrderStatus, UserRole
from database import get_db
from sqlalchemy.orm import Session
from api.auth.auth import get_current_user, admin_required
from repositories.orders import OrderRepository
from repositories.address import AddressRepository
from repositories.cart import CartRepository
from repositories.store import StoreRepository

router = APIRouter(prefix="/orders", tags=["orders"], dependencies=[Depends(oauth2_scheme)])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("/from_cart", status_code=201, response_model=list[OrderSchema])
async def create_order_from_cart(order_data: CreateOrderFromCartSchema, user: user_dependency, db: Session = Depends(get_db)):
    """Create a new order from the user's cart."""
    orders_repo = OrderRepository(db)
    address_repo = AddressRepository(db)
    store_repo = StoreRepository(db)
    cart_repo = CartRepository(db)
    user_cart = cart_repo.get_cart_by_user_id(user.id)

    if not user_cart or not user_cart.items:
        raise HTTPException(status_code=400, detail="Your cart is empty.")
    
    cart_items = user_cart.items
    store_id_list = []
    orders_list = []

    try:
        for item in cart_items:
            if item.item.store_id not in store_id_list:
                store_id_list.append(item.item.store_id)

        for store_id in store_id_list:
            same_store_items = []
            for item in cart_items:
                if item.item.store_id == store_id:
                    same_store_items.append(item)
            
            order = orders_repo.create(user_id=user.id, 
                                    status=OrderStatus.pending,
                                    address=address_repo.get_by_id(order_data.address_id), 
                                    store=store_repo.get_by_id(order_data.store_id))
            orders_list.append(order)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return orders_list
            

@router.patch("/{order_id}/status", response_model=OrderSchema)
async def update_order_status(order_id: int, status_update: OrderStatusUpdateSchema, user: user_dependency, db: Session = Depends(get_db)):
    order_repo = OrderRepository(db)
    order = order_repo.get_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    is_admin = user.role == UserRole.admin
    is_assigned_dasher = order.dasher_id == user.id

    if not (is_admin or is_assigned_dasher):
        raise HTTPException(status_code=403, detail="You do not have permission to update this order's status.")

    update_data = {
        "status": OrderStatus(status_update.status),
        "updated_at": datetime.now()
    }
    if OrderStatus(status_update.status) == OrderStatus.accepted:
        update_data["accepted_at"] = datetime.now()
    elif OrderStatus(status_update.status) == OrderStatus.completed:
        update_data["completed_at"] = datetime.now()
    
    updated_order = order_repo.update_by_id(order_id, **update_data)

    return updated_order

@router.get("/{order_id}", response_model=OrderSchema)
async def get_order(order_id: int, token : str = Depends(oauth2_scheme), db : Session = Depends(get_db)):
    """Get an order by its ID."""

    # First make sure that order belongs to the user or they are an admin

    order_repo = OrderRepository(db)

    order = order_repo.get_by_id(order_id)

    if not order or order.is_deleted: 
        raise HTTPException(status_code=404, detail="Order not found")
    
    user = await get_current_user(token)

    if user.id != order.user_id and not admin_required(user):
        raise HTTPException(status_code=403, detail="You do not have permission to view this order")
    
    return order

@router.get("/status/{status}", response_model=list[OrderSchema])
async def get_order_by_status(status: str, user: user_dependency, db : Session = Depends(get_db)):
    """Get an order by its status."""

    order_repo = OrderRepository(db)

    try:
        order = order_repo.get_by_order_state(OrderStatus(status))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if user.role == UserRole.user:
        raise HTTPException(status_code=403, detail="You do not have permission to access this")
    
    return order

@router.get("/users/{user_id}", response_model=list[OrderSchema])
async def get_order_by_user_id(user_id: str, user: user_dependency, db : Session = Depends(get_db)):
    """Get an order by user ID."""
    
    order_repo = OrderRepository(db)
    order = order_repo.get_by_user_id(user_id)

    if user.role != UserRole.admin and user_id != user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to access this")
    
    return order

@router.get("/dashers/{dasher_id}", response_model=list[OrderSchema])
async def get_order_by_dasher_id(dasher_id: str, user: user_dependency, db : Session = Depends(get_db)):
    """Get an order by dasher ID."""
    
    order_repo = OrderRepository(db)
    order = order_repo.get_by_dasher_id(dasher_id)

    if user.role != UserRole.admin and dasher_id != user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to access this")
    
    return order

@router.get("/stores/{store_id}", response_model=list[OrderSchema])
async def get_store_orders(store_id: int, db: Session = Depends(get_db)):

    order_repo = OrderRepository(db)

    order = order_repo.get_by_store_id(store_id)
    
    return order

@router.post("", status_code=201, response_model=OrderSchema)
async def create_order(order: OrderSchema, user: user_dependency, db : Session = Depends(get_db)):
    """Create a new order."""


    order_repo = OrderRepository(db)

    order.user_id = user.id
    order.created_at = str(datetime.now())
    order.updated_at = str(datetime.now())

    if not admin_required(user) and user.id != order.user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to create an order for this user")
    
    try:
        order = order_repo.create(**order.dict())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return order


@router.patch("/{order_id}", response_model=OrderSchema, status_code=200)
async def update_order(order_id: int, 
                       user: user_dependency,
                       order_data: OrderUpdateSchema, 
                       db : Session = Depends(get_db)):
    """Update an order by its ID."""

    order_repo = OrderRepository(db)

    db_order = order_repo.get_by_id(order_id)

    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not (admin_required(user) or user.id == db_order.user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to update this order")

    update_data = order_data.dict(exclude_unset=True)

    try:
        updated_order = order_repo.update_by_id(order_id, **update_data)
        return updated_order

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}/{order_id}", status_code=200)
async def delete_order(order_id: int, user: user_dependency, token : str = Depends(oauth2_scheme), db : Session = Depends(get_db)):
    """Delete an order by its ID."""

    order_repo = OrderRepository(db)

    order = order_repo.get_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    

    user = await get_current_user(token)

    if not (admin_required(user) or user.id == order.user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to delete this order")
    
    try:
        # We will hard-delete orders that have not been paid for yet.
        if order.status.value == OrderStatus.initialized:
            order_repo.hard_delete(order_id)
        else:
            order_repo.update_by_id(order_id, is_deleted=True)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": "Order deleted successfully"}


