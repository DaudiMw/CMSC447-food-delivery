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
from api.schemas.item_schemas import ItemSchema, ItemWithInfoCreateSchema
from api.schemas.user_schemas import UserAuth

router = APIRouter(dependencies=[Depends(oauth2_scheme)], prefix="/items", tags=["items"])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("/{store_id}", status_code=201, response_model=ItemSchema)
async def add_item_to_store(store_id: int,
                            user: user_dependency,
                            item: str = Form(...),
                            picture: UploadFile = File(None),
                            db: Session = Depends(get_db)):
    """Adds an item to a specified store."""
    """Perms: admin, store owner"""
    items_repo = ItemRepository(db)
    store_repo = StoreRepository(db)
    media_repo = MediaRepository(db)

    # Check permissions
    owners_list = store_repo.check_store_owner(user.id, store_id)
    if user.role != UserRole.admin and not owners_list:
        raise HTTPException(status_code=401, detail="User does not own that store")
    
    try:
        # Parse the JSON item data
        item_data = json.loads(item)
        item_schema = ItemWithInfoCreateSchema(**item_data)
        
        # Prepare item data for creation
        item_dict = {
            "name": item_schema.name,
            "item_type": item_schema.item_type,
            "description": item_schema.description,
            "price": item_schema.price,
            "store_id": store_id
        }
        
        # Prepare nutritional info if provided
        info_dict = None
        if item_schema.nutrition_info:
            info_dict = item_schema.nutrition_info.model_dump(exclude_none=True)
        
        # Handle picture upload first if provided
        if picture and picture.filename:
            content = await picture.read()
            media_record = media_repo.create_no_commit(
                media_data=content,
                filename=picture.filename
            )
            item_dict["picture_id"] = media_record.id
        
        # Create item with nutritional info
        new_item = items_repo.create_with_info_no_commit(item_dict, info_dict)
        
        # Commit the transaction
        db.commit()
        db.refresh(new_item)
        
        return new_item
        
    except json.JSONDecodeError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid JSON format for item data")
    except ValidationError as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create item: {str(e)}")

@router.get("/{store_id}/{item_name}", status_code=201, response_model=list[ItemSchema])
async def get_item_by_store_id_and_name(store_id: int,
                                        item_name: str,
                                        user: user_dependency,
                                        db: Session = Depends(get_db)):
    """Gets an item by name and store ID (both must match exactly)."""
    """Perms: admin, store owner"""
    items_repo = ItemRepository(db)
    store_repo = StoreRepository(db)

    owners_list = store_repo.check_store_owner(user.id, store_id)

    if user.role != UserRole.admin and not owners_list:
        raise HTTPException(status_code=401, detail="User does not own that store")
    
    try:
        item = items_repo.get_by_store_id_and_name(store_id, item_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return item

@router.get("/{store_id}/search", status_code=201, response_model=list[ItemSchema])
async def search_item_by_store_id(store_id: int,
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
async def get_item_by_order_id(order_id: int,
                               user: user_dependency,
                               db: Session = Depends(get_db)):
    """Gets an item by order ID."""
    """Perms: admin, user who placed the order"""
    items_repo = ItemRepository(db)
    order_repo = OrderRepository(db)
    
    order = order_repo.get_by_user_id_and_order_id(user.id, order_id)

    if user.role != UserRole.admin and not order:
        raise HTTPException(status_code=401, detail="User did not place that order")

    try:
        item = items_repo.get_by_user_id_and_ord(order_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return item

@router.put("/{item_id}", status_code=201, response_model=ItemSchema)
async def update_item(item: ItemSchema,
                      item_id: int,
                      user: user_dependency,
                      db: Session = Depends(get_db)):
    items_repo = ItemRepository(db)
    found_item = items_repo.get_by_id(item_id)

    store_repo = StoreRepository(db)
    owners = store_repo.check_store_owner(user.id, found_item.store_id)


    if user.role != UserRole.admin and not owners:
        raise HTTPException(status_code=401, detail="User does not own the store of the item")
    
    items_repo.update_by_id(item_id, 
                            id=item.id, 
                            name=item.name, 
                            item_type=item.item_type, 
                            description=item.description, 
                            price=item.price, 
                            picture=item.picture, 
                            store_id=item.store_id, 
                            info_id=item.info_id)
    
    return found_item
    
