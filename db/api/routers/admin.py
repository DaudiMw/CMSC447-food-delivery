

from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import admin_required, get_current_user, get_password_hash
from db.models import UserRole
from repositories.user import UserRepository
from sqlalchemy.orm import Session
from database import get_db
from api.schemas.user_schemas import UserCreate


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(admin_required)])

@router.get("/users", response_model=list[UserCreate], status_code=200)
async def list_all_users(db: Session = Depends(get_db)):
    """List all users."""

    try:
        user_repo = UserRepository(db)
        users = user_repo.get_all()
        return users
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("users/{user_id}", response_model=UserCreate, status_code=200)
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
    

@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, 
                           new_role: UserRole,
                           db: Session = Depends(get_db)):
    """Update a user's role."""

    try:
        user_repo = UserRepository(db)
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