from api.schemas.user_schemas import UserAuth
from api.schemas.item_schemas import ItemSchema
from repositories.items import ItemRepository
from repositories.store import StoreRepository
from models import StoreHours, UserRole
from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import get_current_user, admin_required
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.store_schemas import StoreSchema, StoreWithItemsSchema


router = APIRouter(prefix="/stores", tags=["stores"], dependencies=[Depends(oauth2_scheme)])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.get("/", response_model=list[StoreSchema])
async def get_all_stores(db : Session = Depends(get_db)):
    """Get all stores"""
    """Perms: none"""
    store_repo = StoreRepository(db)
    stores = store_repo.get_all()
    return stores


@router.post("/", response_model=StoreSchema, status_code=201)
async def create_store(store: StoreSchema,
                       user: user_dependency,
                       db : Session = Depends(get_db)):
    """Create a new store"""
    """Perms: admin"""
          
    # if user.role != UserRole.admin:
    #     raise HTTPException(status_code=401, detail="You do not have permissions to access this.")
    
    try:
        store_repo = StoreRepository(db)
        new_storehours = StoreHours()

        new_store = store_repo.create(**store.dict(), hours=new_storehours)

        return new_store
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# @router.put("/{store_id}", response_model=StoreCreate)
# async def update_store(store: StoreSchema,
#                        user: user_dependency,
#                        db : Session = Depends(get_db)):
#     """Update a store"""

#     try:
#         store_repo = StoreRepository(db)

#         owners = store_repo.check_store_owner(user.id, store.store_id)

#         if user.role != UserRole.admin and not owners:
#             raise HTTPException(status_code=401, detail="You do not have permissions to access this.")
        
#         updated_store = store_repo.update(store.store_id, **store.dict())

#         return updated_store

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
    """Get store by its ID. We will also return all items in the store."""\
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
async def get_store_items_full(store_id: int, db : Session = Depends(get_db)):
    """Get all items in a store with their info."""
    """Perms: none"""
    try: 
        store_repo = StoreRepository(db)

        items = store_repo.get_store_with_items(store_id)

        if not items:
            raise HTTPException(status_code=404, detail="Store not found.")
        
        return items
    
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