from api.schemas.user_schemas import UserAuth
from api.schemas.item_schemas import ItemSchema
from api.schemas.base_schema import Address
from models import UserRole
from repositories.media import MediaRepository
from repositories.address import AddressRepository
from repositories.items import ItemRepository
from repositories.store import StoreRepository
from models import StoreHours, UserRole
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from api.auth.auth import get_current_user
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.store_schemas import StoreSchema, StoreWithItemsSchema, StoreCreateSchema, StoreInfoSchema
from utils.VerifyAddress import verify_address
from datetime import time
import json

import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stores", tags=["stores"], dependencies=[Depends(oauth2_scheme)])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.get("", response_model=list[StoreInfoSchema])
async def get_all_stores(db : Session = Depends(get_db)):
    """Get all stores"""
    """Perms: none"""
    store_repo = StoreRepository(db)
    stores = store_repo.get_all()
    return stores



@router.post("", response_model=StoreSchema, status_code=201)
async def create_store(user: user_dependency,
                       db : Session = Depends(get_db),
                       store: str = Form(...),
                       address: str = Form(...),
                       logo: UploadFile = File(None),
                       banner: UploadFile = File(None)):
    """Create a new store"""
    """Perms: admin"""
          
    if user.role != UserRole.admin:
        raise HTTPException(status_code=401, detail="You do not have permissions to access this.")
    
    try:
        store_data = json.loads(store)
        address_data = json.loads(address)

        store_schema = StoreCreateSchema(**store_data)
        address_schema = Address(**address_data)

        if not verify_address(address_schema):
            raise HTTPException(status_code=400, detail="That address is not valid, it must be within UMBC")

        address_repo = AddressRepository(db)
        new_address = address_repo.create(**address_schema.dict())

        media_repo = MediaRepository(db)
        
        new_store_data = store_schema.dict(exclude={'hours'})
        new_store_data['address_id'] = new_address.address_id

        if logo:
            media_data = await logo.read()
            new_logo_media = media_repo.create(media_data=media_data, filename=logo.filename)
            new_store_data['logo_id'] = new_logo_media.media_id

        if banner:
            media_data = await banner.read()
            new_banner_media = media_repo.create(media_data=media_data, filename=banner.filename)
            new_store_data['banner_id'] = new_banner_media.media_id

        store_repo = StoreRepository(db)
        
        new_store_hours = []
        for hour in store_schema.hours:
            try:
                start_time = time.fromisoformat(hour.start_time) if hour.start_time else None
                end_time = time.fromisoformat(hour.end_time) if hour.end_time else None
            except ValueError as ve:
                logger.error(f"Time parsing error: {ve}, start_time={hour.start_time}, end_time={hour.end_time}")
                raise HTTPException(status_code=400, detail=f"Invalid time format: {str(ve)}")
            
            new_store_hours.append(StoreHours(day=hour.day, start_time=start_time, end_time=end_time))

        created_store = store_repo.create(**new_store_data, hours=new_store_hours)

        return created_store
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Store creation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/{store_id}", response_model=StoreSchema)
async def update_store(store_id: str,
                       user: user_dependency,
                       db : Session = Depends(get_db),
                       store: str = Form(...),
                       address: str = Form(...),
                       picture: UploadFile = File(None)):
    """Update a store"""

    try:
        store_repo = StoreRepository(db)

        owners = store_repo.get_store_owner(user.user_id, store_id)

        if user.role != UserRole.admin and not owners:
            raise HTTPException(status_code=401, detail="You do not have permissions to access this.")
        
        existing_store = store_repo.get_by_id(store_id)
        if not existing_store:
            raise HTTPException(status_code=404, detail="Store not found.")

        store_data = json.loads(store)
        address_data = json.loads(address)

        store_schema = StoreSchema(**store_data)
        address_schema = Address(**address_data)

        if not verify_address(address_schema):
            raise HTTPException(status_code=400, detail="That address is not valid, it must be within UMBC")

        db.begin()
        try:
            # Update address
            address_repo = AddressRepository(db)
            updated_address = address_repo.update(existing_store.address, **address_schema.dict())

            # Update media
            media_repo = MediaRepository(db)
            if picture:
                media_data = await picture.read()
                if existing_store.picture:
                    updated_media = media_repo.update(existing_store.picture, media_data=media_data, filename=picture.filename)
                else:
                    new_media = media_repo.create(media_data=media_data, filename=picture.filename)
                    existing_store.picture_id = new_media.media_id
            elif existing_store.picture and not store_schema.picture: # If picture was removed
                media_repo.delete(existing_store.picture.media_id)
                existing_store.picture_id = None

            # Update store attributes
            update_data = store_schema.dict(exclude={'hours', 'address', 'picture'})
            updated_store = store_repo.update(existing_store, **update_data)

            # Update store hours
            # Delete existing hours
            for hour in existing_store.hours:
                db.delete(hour)
            db.flush() # Flush to ensure deletions are processed before new insertions

            # Create new hours
            new_store_hours = []
            for hour_data in store_schema.hours:
                start_time = time.fromisoformat(hour_data.start_time) if hour_data.start_time else None
                end_time = time.fromisoformat(hour_data.end_time) if hour_data.end_time else None
                new_store_hours.append(StoreHours(store_id=store_id, day=hour_data.day, start_time=start_time, end_time=end_time))
            
            existing_store.hours = new_store_hours
            db.add_all(new_store_hours)
            db.commit()
            db.refresh(updated_store)
            
            return updated_store
        except Exception as e:
            db.rollback()
            logger.error(f"Store update error: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Store update error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=StoreSchema)
async def get_user_stores(user: user_dependency, db: Session = Depends(get_db)):
    """Gets all stores that a user owns."""
    try:
        store_repo = StoreRepository(db)

        store = store_repo.get_user_stores(user.id)

        if not store:
            raise HTTPException(status_code=404, detail="Store not found.")
        
        return store
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{store_id}", response_model=StoreSchema)
async def get_store_by_id(store_id: int, db : Session = Depends(get_db)):
    """Get store by its ID. We will also return all items in the store."""
    """Perms: none"""
    try: 
        store_repo = StoreRepository(db)

        store = store_repo.get_by_id(store_id)

        if not store:
            raise HTTPException(status_code=404, detail="Store not found.")

        return store
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{store_id}/items-full", response_model=StoreWithItemsSchema)
async def get_store_items_full(store_id: str, db: Session = Depends(get_db)):
    """Get all items in a store with their info."""
    """Perms: none"""
    try: 
        store_repo = StoreRepository(db)
        store = store_repo.get_store_with_items(store_id)

        if not store:
            raise HTTPException(status_code=404, detail="Store not found.")
        
        # Convert store to dict and serialize times
        store_dict = {
            "store_id": store.store_id,
            "name": store.name,
            "description": store.description,
            "phone": store.phone,
            "address_id": store.address_id,
            "address": store.address,
            "logo_id": store.logo_id,
            "banner_id":store.banner_id,
            "hours": [
                {
                    "day": h.day,
                    "start_time": h.start_time.isoformat() if h.start_time else None,
                    "end_time": h.end_time.isoformat() if h.end_time else None
                }
                for h in store.hours
            ],
            "items": store.items  # Pydantic will handle this
        }

        print(store_dict)
        
        return store_dict
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{store_id}/items", response_model=list[ItemSchema])
async def get_store_items(store_id: int, db : Session = Depends(get_db)):
    """Get all items in a store."""
    """Perms: none"""

    try:
        item_repo = ItemRepository(db)

        items = item_repo.get_by_store_id(store_id)

        if not items: 
            raise HTTPException(status_code=404, detail="Store not found.")
        
        return items
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.post("/{store_id}/items", response_model=ItemSchema, status_code=201)
async def create_store_item(user: user_dependency, store_id: int, item: ItemSchema, db : Session = Depends(get_db)):
    """Create a new item in a store."""
    """Perms: admin, store owner"""
    try: 
        store_repo = StoreRepository(db)
        
        owners = store_repo.check_store_owner(user.id, store_id)

        if user.role != UserRole.admin and user.role != UserRole.store_owner and not owners:
            raise HTTPException(status_code=401, detail="You do not have permissions to access this.")
        
        
        item_repo = ItemRepository(db)

        new_item = item_repo.create(**item.dict(), store_id=store_id)

        return new_item
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/address", status_code=201)
async def create_store_address(address: Address, db : Session = Depends(get_db)):
    """Add an address"""

    try:

        if not verify_address(address):
            raise HTTPException(status_code=400, detail=f"Invalid address, must be within UMBC Campus")
        
        address_repo = AddressRepository(db)

        address = address_repo.create(**address.dict())

        return {"address_id": address.address_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
