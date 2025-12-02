from typing import Annotated, Optional
from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from api.schemas.user_schemas import UserAuth, UserSchema, UserCreate
from repositories.store import StoreRepository
from models import UserRole
from repositories.user import UserRepository
from repositories.store import StoreRepository
from sqlalchemy.orm import Session
from database import SessionLocal, get_db
from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel


router = APIRouter()


SECRET_KEY= "883169540dc377b78b96831aacebcf3a136f34ce14752f41217d6d6f5e4a334e"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str

password_hash = PasswordHash.recommended()

def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password):
    return password_hash.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(username: str, password: str, Depend) -> UserSchema | bool:
    db = Session()
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(username)
    if not user:
        return False
    
    return user

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)  # Add database dependency
) -> UserAuth:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("id")

        if username is None or user_id is None:
            raise credentials_exception
        
        # Verify user exists in database
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is banned
        if user.is_banned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is banned"
            )
        
        # Return fresh data from database, not from token
        userData = UserAuth(
            email=user.email,
            role=user.role,  # Fresh role from DB
            id=user.id
        )

        return userData
    
    except InvalidTokenError:
        raise credentials_exception
    

def admin_required(current_user: UserAuth = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    return current_user

def dasher_required(current_user: UserAuth = Depends(get_current_user)):
    if current_user.role != UserRole.admin and current_user.role != UserRole.dasher:
        raise HTTPException(status_code=403, detail="Forbidden")
    return current_user

def is_first_user():
    db = SessionLocal()
    user_repo = UserRepository(db)

    users = user_repo.get_all()

    if len(users) == 0:
        return True
    else:
        return False



# def is_store_owner(store_id, current_user : UserAuth = Depends(get_current_user)):
#     db = Session()
#     store_repo = StoreRepository(db)
#     store_owners_list = store_repo.get_store_owner(current_user.user_id, store_id)
#     if store_owners_list.empty():
#         return True
#     else:
#         raise HTTPException(status_code=401, detail="Unauthorized")

# async def get_current_active_user(current_user: UserCreate = Depends(get_current_user)):
#     if current_user.is_banned or current_user.is_deleted:
#         raise HTTPException(status_code=400, detail="Inactive user")
#     return current_user

@router.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                db : Session = Depends(get_db)):
    
    try:
        
        user_repo = UserRepository(db)
        user = user_repo.get_by_email(form_data.username)

        if not user or user.is_banned is True or user.is_deleted is True:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
                )

        # Verify the password using the stored hashed password
        if not verify_password(form_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
                )
        
        token = create_access_token(data={"sub": user.email, "role": user.role.value, "id": user.id})
        # Create an access token for the authenticated user
        return {"access_token": token, "token_type": "bearer"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging in: {e}")


@router.post("/signup", response_model=UserCreate, status_code=201)
async def create_user(user: UserCreate, 
                db : Session = Depends(get_db), 
                status_code=201):
    """Create a new user."""

    user_repo = UserRepository(db)

    try:
        # Hash the password before saving
        user_data = user.dict()
        user_data["password"] = get_password_hash(user_data["password"])

        if is_first_user():
            user_data["role"] = "admin"
        else:
            user_data["role"] = "user"

        new_user = user_repo.create(**user_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    return new_user
    
    
