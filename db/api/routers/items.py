from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import admin_required, get_current_user, is_store_owner
from repositories.items import ItemRepository
from repositories.store import StoreRepository
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.item_schemas import ItemInfoSchema, ItemSchema
from api.schemas.user_schemas import UserAuth

router = APIRouter(dependencies=[Depends(oauth2_scheme)], prefix="/items", tags=["items"])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("", status_code=201, response_model=list[ItemSchema])
async def add_item(item: ItemSchema,
                   store_id: str,
                   user: user_dependency,
                   db: Session = Depends(get_db)):
    
    items_repo = ItemRepository(db)
    store_repo = StoreRepository(db)

    owners_list = store_repo.get_store_owner(user.user_id, store_id)

    if user.user_id != "admin" and not owners_list:
        raise HTTPException(status_code=401, detail="User does not own that store")
    
    try:
        new_item = items_repo.create(**item.dict(), store_id=store_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return new_item



