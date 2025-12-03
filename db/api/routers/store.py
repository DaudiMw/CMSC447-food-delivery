from api.schemas.user_schemas import UserAuth
from api.schemas.item_schemas import ItemSchema, ItemCreateSchema, ItemWithInfoCreateSchema
from api.schemas.base_schema import Address as AddressSchema
from models import Address as AddressModel
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
from api.schemas.store_schemas import StoreSchema, StoreWithItemsSchema, StoreCreateSchema, StoreInfoSchema, StoreUpdateSchema
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
        address_schema = AddressSchema(**address_data)

        if not verify_address(address_schema):
            raise HTTPException(status_code=400, detail="That address is not valid, it must be within UMBC")

        new_address = AddressModel(**address_schema.dict(exclude={'id', 'label'}))

        media_repo = MediaRepository(db)
        
        new_store_data = store_schema.dict(exclude={'hours'})
        new_store_data['address'] = new_address

        if logo:
            media_data = await logo.read()
            new_logo_media = media_repo.create(media_data=media_data, filename=logo.filename)
            new_store_data['logo_id'] = new_logo_media.id

        if banner:
            media_data = await banner.read()
            new_banner_media = media_repo.create(media_data=media_data, filename=banner.filename)
            new_store_data['banner_id'] = new_banner_media.id

        store_repo = StoreRepository(db)
        
        new_store_hours = []
        for hour in store_schema.hours:
            # try:
            #     start_time = time.fromisoformat(hour.start_time) if hour.start_time else None
            #     end_time = time.fromisoformat(hour.end_time) if hour.end_time else None
            # except ValueError as ve:
            #     logger.error(f"Time parsing error: {ve}, start_time={hour.start_time}, end_time={hour.end_time}")
            #     raise HTTPException(status_code=400, detail=f"Invalid time format: {str(ve)}")
            
            new_store_hours.append(StoreHours(day=hour.day, start_time=hour.start_time, end_time=hour.end_time))

        created_store = store_repo.create(**new_store_data, hours=new_store_hours)

        return created_store
    
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Store creation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/{store_id}", response_model=StoreSchema)
async def update_store(store_id: int,
                       user: user_dependency,
                       db : Session = Depends(get_db),
                       store: str = Form(None),
                       address: str = Form(None),
                       logo: UploadFile = File(None),
                       banner: UploadFile = File(None)):
    """Update a store"""
    """Perms: admin, store owner"""

    store_repo = StoreRepository(db)
    
    # Check permissions
    owners = store_repo.check_store_owner(user.id, store_id)
    if user.role != UserRole.admin and not owners:
        raise HTTPException(status_code=401, detail="You do not have permissions to access this.")
    
    existing_store = store_repo.get_by_id(store_id)
    if not existing_store:
        raise HTTPException(status_code=404, detail="Store not found.")

    try:

        # Update Address
        if address:
            address_data = json.loads(address)
            address_schema = AddressSchema(**address_data)
            if not verify_address(address_schema):
                raise HTTPException(status_code=400, detail="That address is not valid, it must be within UMBC")
            
            address_repo = AddressRepository(db)
            if existing_store.address:
                address_repo.update_no_commit(existing_store.address, **address_schema.dict(exclude={'id', 'label'}))
            else:
                new_address = address_repo.create_no_commit(**address_schema.dict(exclude={'id', 'label'}))
                existing_store.address = new_address

        # Update Store Details
        if store:
            store_data = json.loads(store)
            store_schema = StoreUpdateSchema(**store_data)
            update_data = store_schema.dict(exclude_unset=True, exclude={'hours'})
            store_repo.update_no_commit(existing_store, **update_data)

            # Update Hours
            if store_schema.hours is not None:
                # Delete existing hours
                for hour in existing_store.hours:
                    db.delete(hour)
                db.flush()
                # Create new hours
                new_hours = []
                for hour_data in store_schema.hours:
                    # start_time = time.fromisoformat(hour_data.start_time) if hour_data.start_time else None
                    # end_time = time.fromisoformat(hour_data.end_time) if hour_data.end_time else None
                    new_hours.append(StoreHours(store_id=store_id, day=hour_data.day, start_time=hour_data.start_time, end_time=hour_data.end_time))
                existing_store.hours = new_hours

        # Update Media (Logo and Banner)
        media_repo = MediaRepository(db)
        if logo:
            media_data = await logo.read()
            if existing_store.logo:
                media_repo.update_no_commit(existing_store.logo, media_data=media_data, filename=logo.filename)
            else:
                new_logo = media_repo.create_no_commit(media_data=media_data, filename=logo.filename)
                existing_store.logo_id = new_logo.id
        
        if banner:
            media_data = await banner.read()
            if existing_store.banner:
                media_repo.update_no_commit(existing_store.banner, media_data=media_data, filename=banner.filename)
            else:
                new_banner = media_repo.create_no_commit(media_data=media_data, filename=banner.filename)
                existing_store.banner_id = new_banner.id

        db.commit()
        db.refresh(existing_store)
        return existing_store

    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        # logger.error(f"Store creation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", response_model=list[StoreSchema])
async def get_users_stores(user_id: str, user: user_dependency, db: Session = Depends(get_db)):
    """Gets all stores that a user owns."""
    try:
        store_repo = StoreRepository(db)

        store = store_repo.get_user_stores(user_id)

        if user_id != user.id and user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="You do not have permission to access this")

        if not store:
            # return []
            raise HTTPException(status_code=404, detail="Store not found.")
        
        return store
    
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        
        raise HTTPException(status_code=500, detail=f"Unkown server error when getting user's owned stores with user ID: {user_id}")


@router.get("/{store_id}/info", response_model=StoreSchema)
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
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{store_id}/items-full", response_model=StoreWithItemsSchema)
async def get_store_items_full(store_id: int, db: Session = Depends(get_db)):
    """Get all items in a store with their info."""
    """Perms: none"""
    try: 
        store_repo = StoreRepository(db)
        store = store_repo.get_store_with_items(store_id)

        if not store:
            raise HTTPException(status_code=404, detail="Store not found.")
        
        return store
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unkown server error when fetching a stores items with store ID {store_id}")
    
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
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Unkown server error when getting all items in a store with id {store_id}")
    
    
@router.post("/address", status_code=201)
async def create_store_address(address: AddressSchema, db : Session = Depends(get_db)):
    """Add an address"""

    try:

        if not verify_address(address):
            raise HTTPException(status_code=400, detail="Invalid address, must be within UMBC Campus")
        
        address_repo = AddressRepository(db)

        address = address_repo.create(**address.dict(exclude={'id', 'label'}))

        return {"address_id": address.address_id}
    
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Unkown server error when adding an address.")
    

@router.delete("/{store_id}", status_code=204)
async def delete_store(store_id: int, user: user_dependency, db: Session = Depends(get_db)):
    """Delete a store"""

    store_repo = StoreRepository(db)
    
    # Check permissions
    owners = store_repo.check_store_owner(user.id, store_id)
    if user.role != UserRole.admin and not owners:
        raise HTTPException(status_code=401, detail="You do not have permissions to access this.")
    
    try:
        store = store_repo.get_by_id(store_id)

        if not store:
            raise HTTPException(status_code=404, detail="Store that was requested for deletion was not found.")
        
        item_repo = ItemRepository(db)

        items = item_repo.get_by_store_id(store_id)

        media_repo = MediaRepository(db)

        for media_id in [store.banner_id, store.logo_id]: # type: ignore
            if media_id:
                media_repo.delete(media_id)
                
        store_repo.delete(store_id)

        for item in items:
            item_repo.delete(item.id)

        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Unkown server error when deleting a store with id {store_id}")
        
    
