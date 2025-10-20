from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import admin_required, get_current_user, get_password_hash
from db.api.schemas.order_schemas import OrderSchema, OrderShow
from db.repositories.orders import OrderRepository
from repositories.user import UserRepository
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.user_schemas import UserCreate

router = APIRouter()

@router.get("/me", response_model=UserCreate)
async def read_users_me(current_user: UserCreate = Depends(get_current_user)):
    return current_user

@router.post("/")
async def create_user(user: UserCreate, 
                db : Session = Depends(get_db), 
                status_code=201):
    """Create a new user."""

    user_repo = UserRepository(db)

    try:
        # Hash the password before saving
        user_data = user.dict()
        user_data["password"] = get_password_hash(user_data["password"])

        new_user = user_repo.create(**user_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    return new_user


@router.put("/{user_id}", response_model=UserCreate, status_code=200)
async def update_user(user_id: str, 
                      token : str = Depends(oauth2_scheme), 
                      db : Session = Depends(get_db)):
    """Update a user by their ID."""
    
    user = await get_current_user(token)

    if user.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to update this user")
    
    user_repo = UserRepository(db)

    try:
        user_data = user.dict()
        updated_user = user_repo.update_by_id(user_id, **user_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return updated_user

@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str, 
                      token : str = Depends(oauth2_scheme), 
                      db : Session = Depends(get_db)):
    """Delete a user by their ID. We will perform a hard-delete
        because emails need to be unique and we cannot keep old records with potentially
        duplicate emails if a user tries to create a new account using an email from a deleted account."""
    
    user = await get_current_user(token)

    if not (admin_required(user) or user.user_id == user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to delete this user")
    
    user_repo = UserRepository(db)

    try:
        user_repo.hard_delete(user_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": "User deleted successfully"}


@router.get("/{user_id}/cart", response_model=list[OrderShow])
async def get_user_cart(user_id: str, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get a user's cart."""

    order_repo = OrderRepository(db)

    try:
        orders = order_repo.get_by_user_id_ordered_by_date(user_id)
        orders = [order.status == "initialized" for order in orders]
        return orders
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/orders", response_model=list[OrderShow])
async def get_user_orders(user_id: str, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get a user's orders."""

    order_repo = OrderRepository(db)

    try:
        orders = order_repo.get_by_user_id_ordered_by_date(user_id)
        orders = [order.status not in ["initialized", "dropped", "completed"] for order in orders]
        return orders
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/order-history", response_model=list[OrderShow])
async def get_user_order_history(user_id: str, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get a user's order history."""

    order_repo = OrderRepository(db)

    try:
        orders = order_repo.get_by_user_id_ordered_by_date(user_id)
        orders = [order.status != "initialized" for order in orders]
        return orders
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/{user_id}/password")
async def change_password(user_id: str, new_password: str, db: Session = Depends(get_db)):
    """Change a user's password."""

    if user.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to update this user")
    
    user_repo = UserRepository(db)

    try:
        user = user_repo.change_password(user_id, new_password)
        return {"message": "Password changed successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    





    
