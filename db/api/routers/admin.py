from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import admin_required, get_current_user
from models import UserRole
from repositories.user import UserRepository
from repositories.dasherapplication import ApplicationRepository
from sqlalchemy.orm import Session
from database import get_db
from api.schemas.user_schemas import UserSchema, UserCreate, UserAuth



router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(admin_required)])

@router.get("/users", response_model=list[UserSchema], status_code=200)
async def list_all_users(db: Session = Depends(get_db)):
    """List all users."""

    try:
        user_repo = UserRepository(db)
        users = user_repo.get_all()
        return users
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/users/{user_id}", response_model=UserCreate, status_code=200)
async def get_user_by_id(user_id: str,
                   db : Session = Depends(get_db)):
    """Get a user by their ID."""

    user_repo = UserRepository(db)

    try:
        user = user_repo.get_by_id(user_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
    

@router.patch("/users/{user_id}/role", response_model=UserSchema)
async def update_user_role(user_id: str, 
                           new_role: UserRole,
                           db: Session = Depends(get_db),
                           current_user: UserAuth = Depends(get_current_user)):
    """Update a user's role."""

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Admins cannot change their own role.")

    try:
        user_repo = UserRepository(db)
        
        user_to_update = user_repo.get_by_id(user_id)
        if not user_to_update:
            raise HTTPException(status_code=404, detail="User not found")

        if user_to_update.role == UserRole.admin and new_role != UserRole.admin:
            if user_repo.count_admins() <= 1:
                raise HTTPException(status_code=400, detail="Cannot remove the last admin.")

        updated_user = user_repo.update_role(user_id, new_role)
        return updated_user
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.patch("/users/{user_id}/ban")
async def ban_user(user_id: str, 
                    db: Session = Depends(get_db)):
    """Ban a user."""

    try:
        user_repo = UserRepository(db)
        user = user_repo.change_ban_status(user_id, True)
        return user


    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@router.get("/users/search")
async def search_users(query: str, 
                       db: Session = Depends(get_db)):
    """Search for users by name or campus ID."""
    
    try:
        user_repo = UserRepository(db)
        users = user_repo.query_by_name_or_campus_id(query)
        return users
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/dasher-applications")
async def get_dasher_applications(db: Session = Depends(get_db)):
    """Get all dasher applications."""

    app_repo = ApplicationRepository(db)
    user_repo = UserRepository(db)

    try:
        applications = app_repo.get_all()
        for application in applications:
            user = user_repo.get_by_id(str(application.user_id))
            if user:
                application.user = user

        return applications
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dasher-deliveries")
async def get_dasher_deliveries(db: Session = Depends(get_db)):
    """Get all dasher deliveries."""

    return []

@router.get("/orders")
async def get_orders(db: Session = Depends(get_db)):
    """Get all orders."""

    return []

@router.post("/dasher-applications/{application_id}/approve")
async def approve_dasher_application(application_id: int, db: Session = Depends(get_db)):
    """Approve a dasher application."""

    app_repo = ApplicationRepository(db)

    try:
        application = app_repo.get_by_id(application_id)

        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get the user associated with the application
        user_repo = UserRepository(db)
        user = user_repo.update_by_id(str(application.user_id), role=UserRole.dasher)
        app_repo.hard_delete(application_id)

        return {"message": "Application approved", "user": user}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))