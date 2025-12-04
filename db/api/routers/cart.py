from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import Annotated
from database import get_db
from api.auth.auth import get_current_user, oauth2_scheme
from api.schemas.user_schemas import UserAuth
from api.schemas.cart_schemas import CartSchema, CartItemCreate, CartItemSchema, CartItemUpdate
from repositories.cart import CartRepository

router = APIRouter(prefix="/cart", tags=["cart"], dependencies=[Depends(oauth2_scheme)])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.get("", response_model=CartSchema)
async def get_user_cart(user: user_dependency, db: Session = Depends(get_db)):
    """Get the current user's cart."""
    try:
        cart_repo = CartRepository(db)
        cart = cart_repo.get_or_create_cart_by_user_id(user.id)
        return cart
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unkown server error when fetching the cart.")

@router.post("/items", response_model=CartItemSchema, status_code=201)
async def add_item_to_cart(user: user_dependency, cart_item: CartItemCreate, db: Session = Depends(get_db)):
    """Add an item to the cart. If the item already exists, its quantity will be increased."""
    try:
        cart_repo = CartRepository(db)
        cart = cart_repo.get_or_create_cart_by_user_id(user.id)
        new_cart_item = cart_repo.add_item_to_cart(cart, cart_item.item_id, cart_item.quantity)
        return new_cart_item
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Unkown server error when adding item to the cart.")

@router.put("/items/{item_id}", response_model=CartItemSchema)
async def update_cart_item_quantity(user: user_dependency, item_id: int, item_update: CartItemUpdate, db: Session = Depends(get_db)):
    """Update an item's quantity in the cart. A quantity of 0 or less will remove the item."""
    try:
        cart_repo = CartRepository(db)
        cart = cart_repo.get_cart_by_user_id(user.id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        
        updated_item = cart_repo.update_item_quantity(cart, item_id, item_update.quantity)
        
        if not updated_item and item_update.quantity > 0:
            raise HTTPException(status_code=404, detail="Item not found in cart")

        if item_update.quantity <= 0:
            return Response(status_code=204) # No content to return
            
        return updated_item
    
    except ValueError as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=404, detail=f"Unkown server error when changing quantity of item with ID: {item_id} in the cart.")

@router.delete("/items/{item_id}", status_code=204)
async def remove_item_from_cart(user: user_dependency, item_id: int, db: Session = Depends(get_db)):
    """Remove an item from the cart."""
    try:
        cart_repo = CartRepository(db)
        cart = cart_repo.get_cart_by_user_id(user.id)
        if cart:
            removed = cart_repo.remove_item_from_cart(cart, item_id)
            if not removed:
                raise HTTPException(status_code=404, detail="Item not found in cart")

        return Response(status_code=204)
    
    except ValueError as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=404, detail=f"Unkown server error when deleting item with ID {item_id} from the cart.")

@router.delete("", status_code=204)
async def clear_user_cart(user: user_dependency, db: Session = Depends(get_db)):
    """Clear all items from the cart."""
    try:
        cart_repo = CartRepository(db)
        cart = cart_repo.get_cart_by_user_id(user.id)
        if cart:
            cart_repo.clear_cart(cart)
        
        return Response(status_code=204)
    except ValueError as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=404, detail=f"Unkown server error when clearing the cart.")


