from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import get_current_active_user
from repositories.user import UserRepository
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.user_schemas import UserSchema, UserCreate

router = APIRouter()

@router.get("/me", response_model=UserCreate)
async def read_users_me(current_user: UserCreate = Depends(get_current_active_user)):
    return current_user


@router.get("/", response_model=list[UserCreate])
async def get_all_users(token : str = Depends(oauth2_scheme),
                  db : Session = Depends(get_db), 
                  status_code=200):

    user_repo = UserRepository(db)
    try:
        users = user_repo.get_all()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return users

@router.post("/")
async def create_user(user: UserCreate, 
                token : Annotated[str, Depends(oauth2_scheme)],
                db : Session = Depends(get_db), 
                status_code=201):

    user_repo = UserRepository(db)

    try:
        new_user =user_repo.create(**user.dict())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    return new_user


@router.get("/{user_id}", response_model=UserCreate, status_code=200)
async def get_user_by_id(user_id: str,
                   token : Annotated[str, Depends(oauth2_scheme)],
                   db : Session = Depends(get_db)):

    user_repo = UserRepository(db)

    return user_repo.get_by_id(user_id)
