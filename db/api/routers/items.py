from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import admin_required, get_current_user, is_store_owner, store_owner_required
from api.schemas.order_schemas import OrderShow
from repositories.orders import OrderRepository
from repositories.items import ItemRepository
from repositories.store import StoreRepository
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.item_schemas import ItemInfoSchema, ItemSchema
from api.schemas.store_schemas import StoreSchema
from api.schemas.user_schemas import UserAuth

router = APIRouter(dependencies=[Depends(oauth2_scheme), store_owner_required], prefix="/items", tags=["items"])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("", status_code=201, response_model=list[ItemSchema])
async def add_item(item: ItemSchema,
                   user: user_dependency,
                   db: Session = Depends(get_db)):
    
    items_repo = ItemRepository(db)
    store_repo = StoreRepository(db)

    store_repo = store_repo.get_store_owner(user.user_id, )


    if user.user_id


