from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import admin_required, get_current_user
from models import UserRole, Order
from repositories.user import UserRepository
from repositories.dasherapplication import ApplicationRepository
from sqlalchemy.orm import Session, joinedload
from database import get_db
from api.schemas.user_schemas import UserSchema, UserCreate, UserAuth, DasherApplicationSchema
from api.schemas.order_schemas import OrderSchema
from repositories.orders import OrderRepository
from api.schemas.user_schemas import UserSchema, UserCreate, UpdateUserRole



router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(admin_required)])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.get("/users", response_model=list[UserSchema], status_code=200)
async def list_all_users(db: Session = Depends(get_db)):
    """List all users."""

    try:
        user_repo = UserRepository(db)
        users = user_repo.get_all()
        return users
    
    except Exception as e:
        raise HTTPException(status_code=500, detail='Unkown server error when fetching all users')
    
@router.get("/users/{user_id}", response_model=UserCreate, status_code=200)
async def get_user_by_id(user_id: str,
                   db : Session = Depends(get_db)):
    """Get a user by their ID."""

    user_repo = UserRepository(db)

    try:
        user = user_repo.get_by_id(user_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unknown server error when fetching user with ID: {user_id}")
    
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    
    return user
    

@router.patch("/users/{user_id}/role", response_model=UserSchema)
async def update_user_role(user_id: str, 
                           new_role: UpdateUserRole,
                           current_user: user_dependency,
                           db: Session = Depends(get_db)):
    """Update a user's role."""

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Admins cannot change their own role.")

    try:
        user_repo = UserRepository(db)
        updated_user = user_repo.update_role(user_id, UserRole(new_role.user_role))
        return updated_user
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unkown server error when updating role of user with ID: {user_id}")
    

@router.patch("/users/{user_id}/ban")
async def ban_user(user_id: str, 
                   current_user: user_dependency,
                    db: Session = Depends(get_db)):
    """Ban a user."""

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Admins cannot ban themselves.")
    try:
        user_repo = UserRepository(db)
        user = user_repo.change_ban_status(user_id, True)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unkown server error when banning user with ID: {user_id}")

@router.patch("/users/{user_id}/unban")
async def unban_user(user_id: str,
                     db: Session = Depends(get_db)):
    """Unban a user."""
    
    try:
        user_repo = UserRepository(db)
        user = user_repo.change_ban_status(user_id, False)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unkown server error unbanning user with ID: {user_id}")
    
@router.get("/users/search")
async def search_users(query: str, 
                       db: Session = Depends(get_db)):
    """Search for users by name or campus ID."""
    
    try:
        user_repo = UserRepository(db)
        users = user_repo.query_by_name_or_campus_id(query)
        return users
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unkown server error when searching for users using query: {query}")
    

@router.get("/dasher-applications", response_model=list[DasherApplicationSchema])
async def get_dasher_applications(db: Session = Depends(get_db)):
    """Get all dasher applications."""

    app_repo = ApplicationRepository(db)

    try:
        applications = app_repo.get_all_with_user()
        return applications
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unkown server error when fetching the dasher applications")


@router.get("/dasher-deliveries", response_model=list[OrderSchema])
async def get_dasher_deliveries(db: Session = Depends(get_db)):
    """Get all dasher deliveries."""
    try:
        order_repo = OrderRepository(db)
        deliveries = order_repo.get_all_deliveries()
        return deliveries
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unkown server error when fetching all dasher deliveries.")

@router.get("/orders", response_model=list[OrderSchema])
async def get_orders(db: Session = Depends(get_db)):
    """Get all orders."""
    order_repo = OrderRepository(db)
    orders = order_repo.get_all(options=[joinedload(Order.user), joinedload(Order.items)])
    return orders

@router.post("/dasher-applications/{application_id}/approve")
async def approve_dasher_application(application_id: int, db: Session = Depends(get_db)):
    """Approve a dasher application."""

    app_repo = ApplicationRepository(db)
    user_repo = UserRepository(db)

    try:
        application = app_repo.get_by_id(application_id)

        if not application:
            raise HTTPException(status_code=404, detail=f"Application with ID {application_id} not found")
        
        # Get the user associated with the application
        user = user_repo.update_role(str(application.user_id), UserRole.dasher)
        app_repo.hard_delete(application_id)

        return {"message": "Application approved", "user": user}

    except Exception as e:

        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Unkown server error when accepting application with ID {application_id}")

@router.post("/dasher-applications/{application_id}/reject")
async def reject_dasher_application(application_id: int, db: Session = Depends(get_db)):
    """Reject a dasher application."""

    app_repo = ApplicationRepository(db)

    try:
        application = app_repo.get_by_id(application_id)

        if not application:
            raise HTTPException(status_code=404, detail=f"Application with ID {application_id} not found")
        
        app_repo.hard_delete(application_id)

        return {"message": "Application rejected"}

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Unkown server error when rejecting application with ID {application_id}")