from db.repositories.pickups import PickUpsRepository
from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import get_current_user, dasher_required
from repositories.user import UserRepository
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from schemas.pickup_schema import PickUpSchema


router = APIRouter(prefix=["pickups"], tags=["pickups"], dependencies=dasher_required)



@router.get("/{user_id}", response_model=list[PickUpSchema])
async def get_dashers_pickups(user_id: str, 
                              token = Annotated[str, Depends(oauth2_scheme)],
                              db : Session = Depends(get_db)):
    """Get all of a dashers currently picked up items"""

    user = get_current_user(token)
          
    if user.role == "admin" or user.role == "dasher":
        raise HTTPException(status_code=401, detail="You do not have permissions to access this.")
    
    pickup_repo = PickUpsRepository(db)

    pickups = pickup_repo.get_by_dasher_id(user_id)

    return pickups

@router.patch("/{pickup_id}/{order_id}/status", status_code=200)
async def change_order_status(pickup_id: str, order_id: str,
                              token = Annotated[str, Depends(oauth2_scheme)]):
    """Edit the status of a picked up order."""

    user = get_current_user(token)






