from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.auth.auth import admin_required, get_current_user
from api.schemas.order_schemas import OrderShow
from repositories.dasherapplication import ApplicationRepository
from repositories.orderitems import OrderItemsRepository
from repositories.address import AddressRepository
from repositories.orders import OrderRepository
from repositories.user import UserRepository
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.user_schemas import ApplicationCreate, UserCreate, UserAuth
from api.schemas.base_schema import Address

router = APIRouter(dependencies=[Depends(oauth2_scheme)], prefix="/users", tags=["users"])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.get("/me", response_model=UserCreate)
async def read_users_me(current_user: UserCreate = Depends(get_current_user)):
    return current_user

@router.put("/{user_id}", response_model=UserCreate, status_code=200)
async def update_user(user_id: str, 
                      user: user_dependency,
                      db : Session = Depends(get_db)):
    """Update a user by their ID."""


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
                      user : user_dependency,
                      db : Session = Depends(get_db)):
    """Delete a user by their ID. We will perform a hard-delete
        because emails need to be unique and we cannot keep old records with potentially
        duplicate emails if a user tries to create a new account using an email from a deleted account."""
    
    if not (admin_required(user) or user.user_id == user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to delete this user")
    
    user_repo = UserRepository(db)

    try:
        user_repo.hard_delete(user_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": "User deleted successfully"}


@router.get("/{user_id}/cart", response_model=list[OrderShow])
async def get_user_cart(user_id: str, user: user_dependency, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get a user's cart."""

    order_repo = OrderRepository(db)

    if user.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this user's cart")
    

    try:
        orders = order_repo.get_by_user_id_ordered_by_date(user_id)
        orders = [order.status == "initialized" for order in orders]
        return orders
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}/cart", status_code=200)
async def add_to_cart(user_id: str, item_id: str, user: user_dependency, db: Session = Depends(get_db)):
    """Add an item to a user's cart."""
    order_repo = OrderRepository(db)
    orderitems_repo = OrderItemsRepository(db)

    if user.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to add to this user's cart")
    
    try:
        # First check if there is an already initialized order to add to.
        order = order_repo.get_by_user_id_and_status(user_id, "initialized")
        if not order:
            order = order_repo.create(user_id=user_id, status="initialized")
        
        orderitems_repo.create(order_id=order.order_id, item_id=item_id)

        return {"message": "Item added to cart successfully"}
    
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
    

@router.post("/{user_id}/password")
async def change_password(user_id: str, user: user_dependency, new_password: str, db: Session = Depends(get_db)):
    """Change a user's password."""

    if user.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to update this user")
    
    user_repo = UserRepository(db)

    try:
        user = user_repo.change_password(user_id, new_password)
        return {"message": "Password changed successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/address", status_code=201)
async def add_address(user_id: str, address_info: Address, user: user_dependency, db: Session = Depends(get_db)):
    """Add an address to a user."""

    if user.user_id != user_id:
        raise HTTPException(status_code=401, detail="You do not have permission to update this user")
    
    address_repo = AddressRepository(db)

    try:
        address = address_repo.create(user_id=user_id, **address_info.dict())
        return address
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/{user_id}/address/{address_id}", response_model=Address, status_code=200)
async def update_address(user_id: str, address_id: str, address_info: Address, user: user_dependency, db: Session = Depends(get_db)):
    """Update an address for a user."""

    if user.user_id != user_id:
        raise HTTPException(status_code=401, detail="You do not have permission to update this user")
    
    address_repo = AddressRepository(db)

    try:
        address = address_repo.update_by_id(address_id, **address_info.dict())
        return address
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.get("/{user_id}/address", response_model=list[Address])
async def get_user_addresses(user_id: str, user: user_dependency, db: Session = Depends(get_db)):
    """Get a user's addresses."""

    user_repo = UserRepository(db)

    if user.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this user's addresses")
    
    try:
        user = user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        addresses = user.addresses
        return addresses

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{user_id}/address/{address_id}", status_code=204)
async def delete_user_address(user_id: str, address_id: str, user: user_dependency, db: Session = Depends(get_db)):
    """Delete a user's address."""
    user_repo = UserRepository(db)

    if user.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this user's address")
    
    try:

        address_repo = AddressRepository(db)
        address_repo.hard_delete(address_id)

        return {"message": "Address deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/{user_id}/dasher-application", status_code=201)
async def create_dasher_application(user_id: str, application_data: ApplicationCreate, user: user_dependency, db: Session = Depends(get_db)):
    """Create a dasher application for a user."""

    if user.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to create this dasher application")
    
    application_repo = ApplicationRepository(db)
    print("Creating dasher application for user_id:", user_id)
    print("Application data:", application_data.content)

    try:
        application = application_repo.create_application(user_id, application_data.content)
        if not application:
            raise HTTPException(status_code=400, detail="Dasher application already exists for this user")
        return application
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    





    
