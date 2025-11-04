from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import get_current_user
from repositories.items import ItemRepository
from repositories.orders import OrderRepository
from repositories.store import StoreRepository
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.item_schemas import ItemInfoSchema, ItemSchema
from api.schemas.user_schemas import UserAuth

router = APIRouter(dependencies=[Depends(oauth2_scheme)], prefix="/items", tags=["items"])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("/{store_id}", status_code=201, response_model=list[ItemSchema])
async def add_item_to_store(item: ItemSchema,
                            store_id: str,
                            user: user_dependency,
                            db: Session = Depends(get_db)):
    """Adds an item to a specified store."""
    """Perms: admin, store owner"""
    items_repo = ItemRepository(db)
    store_repo = StoreRepository(db)

    owners_list = store_repo.get_store_owner(user.user_id, store_id)

    if user.role != "admin" and not owners_list:
        raise HTTPException(status_code=401, detail="User does not own that store")
    
    try:
        new_item = items_repo.create(**item.dict(), store_id=store_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return new_item

@router.get("/{store_id}/{item_name}", status_code=201, response_model=list[ItemSchema])
async def get_item_by_store_id_and_name(store_id: str,
                                        item_name: str,
                                        user: user_dependency,
                                        db: Session = Depends(get_db)):
    """Gets an item by name and store ID (both must match exactly)."""
    """Perms: admin, store owner"""
    items_repo = ItemRepository(db)
    store_repo = StoreRepository(db)

    owners_list = store_repo.get_store_owner(user.user_id, store_id)

    if user.role != "admin" and not owners_list:
        raise HTTPException(status_code=401, detail="User does not own that store")
    
    try:
        item = items_repo.get_by_store_id_and_name(store_id, item_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return item

@router.get("/{store_id}/search", status_code=201, response_model=list[ItemSchema])
async def search_item_by_store_id(store_id: str,
                                  query: str,
                                  user: user_dependency,
                                  db: Session = Depends(get_db)):
    """Searches an item by name and description within a store."""
    """Perms: none"""
    items_repo = ItemRepository(db)
    
    try:
        item = items_repo.search_items_by_store(store_id, query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return item

@router.get("/{order_id}", status_code=201, response_model=list[ItemSchema])
async def get_item_by_order_id(order_id: str,
                               user: user_dependency,
                               db: Session = Depends(get_db)):
    """Gets an item by order ID."""
    """Perms: admin, user who placed the order"""
    items_repo = ItemRepository(db)
    order_repo = OrderRepository(db)
    
    order = order_repo.get_by_user_id_and_order_id(user.user_id, order_id)

    if user.role != "admin" and not order:
        raise HTTPException(status_code=401, detail="User did not place that order")

    try:
        item = items_repo.get_by_user_id_and_ord(order_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return item

