import json
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import ValidationError
from api.auth.auth import get_current_user
from repositories.media import MediaRepository
from repositories.items import ItemRepository
from repositories.orders import OrderRepository
from repositories.store import StoreRepository
from sqlalchemy.orm import Session
from database import get_db
from models import UserRole
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.item_schemas import ItemSchema, ItemWithInfoCreateSchema, ItemSchemaWithInfo
from api.schemas.user_schemas import UserAuth
import logging
logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(oauth2_scheme)], prefix="/items", tags=["items"])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("/{store_id}", status_code=201, response_model=ItemSchema)
async def add_item_to_store(store_id: int,
                            user: user_dependency,
                            item: str = Form(...),
                            picture: UploadFile = File(None),
                            db: Session = Depends(get_db)):
    """Adds an item to a specified store."""
    items_repo = ItemRepository(db)
    store_repo = StoreRepository(db)
    media_repo = MediaRepository(db)

    owners_list = store_repo.check_store_owner(user.id, store_id)
    logger.error(f"User role: {user.role}, type: {type(user.role)}")
    if user.role != UserRole.admin and not owners_list:
        raise HTTPException(status_code=401, detail="User does not own that store")
    
    try:
        item_data = json.loads(item)
        item_schema = ItemWithInfoCreateSchema(**item_data)
        
        item_dict = {
            "name": item_schema.name,
            "item_type": item_schema.item_type,
            "description": item_schema.description,
            "price": item_schema.price,
            "store_id": store_id
        }
        
        info_dict = item_schema.nutrition_info.model_dump(exclude_none=True) if item_schema.nutrition_info else None
        
        if picture and picture.filename:
            content = await picture.read()
            media_record = media_repo.create_no_commit(media_data=content, filename=picture.filename)
            item_dict["picture_id"] = media_record.id
        
        new_item = items_repo.create_with_info_no_commit(item_dict, info_dict)
        
        db.commit()
        db.refresh(new_item)
        
        return new_item
        
    except (json.JSONDecodeError, ValidationError) as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=f"Invalid item data: {e}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create item: {str(e)}")

@router.get("/{item_id}", response_model=ItemSchemaWithInfo)
async def get_item_by_id(item_id: int, db: Session = Depends(get_db)):
    """Gets an item by its ID."""
    items_repo = ItemRepository(db)
    item = items_repo.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{store_id}/{item_id}", response_model=ItemSchema)
async def update_item(store_id: int,
                      item_id: int,
                      user: user_dependency,
                      item: str = Form(...),
                      picture: UploadFile = File(None),
                      db: Session = Depends(get_db)):
    """Updates an item in a specified store."""
    items_repo = ItemRepository(db)
    store_repo = StoreRepository(db)
    media_repo = MediaRepository(db)

    owners_list = store_repo.check_store_owner(user.id, store_id)
    if user.role != UserRole.admin and not owners_list:
        raise HTTPException(status_code=401, detail="User does not own that store")
        
    existing_item = items_repo.get_by_id(item_id)
    if not existing_item or existing_item.store_id != store_id:
        raise HTTPException(status_code=404, detail="Item not found in this store")

    try:
        item_data = json.loads(item)
        item_schema = ItemWithInfoCreateSchema(**item_data)
        
        item_dict = {
            "name": item_schema.name,
            "item_type": item_schema.item_type,
            "description": item_schema.description,
            "price": item_schema.price,
        }
        
        info_dict = item_schema.nutrition_info.model_dump(exclude_none=True) if item_schema.nutrition_info else None
        
        if picture and picture.filename:
            content = await picture.read()
            if existing_item.picture_id:
                media_repo.update_no_commit(existing_item.picture, media_data=content, filename=picture.filename)
            else:
                media_record = media_repo.create_no_commit(media_data=content, filename=picture.filename)
                item_dict["picture_id"] = media_record.id
        
        updated_item = items_repo.update_with_info(existing_item, item_dict, info_dict)
        
        db.commit()
        db.refresh(updated_item)
        
        return updated_item
        
    except (json.JSONDecodeError, ValidationError) as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=f"Invalid item data: {e}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update item: {str(e)}")

@router.get("/{store_id}/search", response_model=list[ItemSchema])
async def search_item_by_store_id(store_id: int,
                                  query: str,
                                  db: Session = Depends(get_db)):
    """Searches an item by name and description within a store."""
    items_repo = ItemRepository(db)
    items = items_repo.search_items_by_store(store_id, query)
    return items

@router.get("/order/{order_id}", response_model=list[ItemSchema])
async def get_items_by_order_id(order_id: int,
                               user: user_dependency,
                               db: Session = Depends(get_db)):
    """Gets all items for a given order ID."""
    order_repo = OrderRepository(db)
    order = order_repo.get_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if user.role != UserRole.admin and order.user_id != user.id:
        raise HTTPException(status_code=401, detail="User did not place that order")

    items_repo = ItemRepository(db)
    items = items_repo.get_by_order_id(order_id)
    return items
