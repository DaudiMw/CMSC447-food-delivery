from sqlalchemy.orm import Session
from models import Cart, CartItem, Item
from .base import BaseRepository

class CartRepository(BaseRepository[Cart]):
    def __init__(self, session: Session):
        super().__init__(Cart, session)

    def get_cart_by_user_id(self, user_id: str) -> Cart | None:
        return self.session.query(Cart).filter(Cart.user_id == user_id).first()

    def get_or_create_cart_by_user_id(self, user_id: str) -> Cart:
        cart = self.get_cart_by_user_id(user_id)
        if not cart:
            cart = self.create(user_id=user_id)
        return cart

    def add_item_to_cart(self, cart: Cart, item_id: int, quantity: int) -> CartItem:
        # Check if item already in cart
        cart_item = self.session.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.item_id == item_id).first()

        if cart_item:
            cart_item.quantity += quantity
        else:
            # Check if item exists
            item = self.session.query(Item).filter(Item.id == item_id).first()
            if not item:
                raise ValueError("Item not found")

            cart_item = CartItem(cart_id=cart.id, item_id=item_id, quantity=quantity)
            self.session.add(cart_item)
        
        self.commit()
        self.session.refresh(cart_item)
        return cart_item

    def update_item_quantity(self, cart: Cart, item_id: int, quantity: int) -> CartItem | None:
        cart_item = self.session.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.item_id == item_id).first()
        if not cart_item:
            return None

        if quantity <= 0:
            self.session.delete(cart_item)
            self.commit()
            return None
        else:
            cart_item.quantity = quantity
            self.commit()
            self.session.refresh(cart_item)
            return cart_item

    def remove_item_from_cart(self, cart: Cart, item_id: int):
        cart_item = self.session.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.item_id == item_id).first()
        if cart_item:
            self.session.delete(cart_item)
            self.commit()
            return True
        return False
        
    def clear_cart(self, cart: Cart):
        for item in cart.items:
            self.session.delete(item)
        self.commit()
