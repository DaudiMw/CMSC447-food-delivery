from sqlalchemy import Column, Integer, Numeric, Boolean, String, DateTime, ForeignKey, Enum as SqlEnum, func
from sqlalchemy.orm import relationship
from database import Base
import enum

class UserRole(enum.Enum):
    admin = "admin"
    store_owner = "store_owner"
    dasher = "dasher"
    user = "user"

class OrderStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    completed = "completed"
    dropped = "dropped"


class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    campus_id = Column(String, nullable=False, unique=True, index=True)
    first_name = Column(String, nullable=False, index=True)
    last_name = Column(String)
    role = Column(SqlEnum(UserRole), nullable=False, default=UserRole.user)
    is_banned = Column(Boolean, nullable=False, default=False)
    orders = relationship("Order", back_populates="user")


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    address = Column(String, nullable=False)
    status = Column(SqlEnum(OrderStatus), nullable=False, default=OrderStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="orders")

    items = relationship(
        "Item",
        secondary="user_orders",
        back_populates="orders"
    )

class OrderItems(Base):
    __tablename__ = "user_orders"

    user_items_id = Column(String, primary_key=True, index=True, nullable=False)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False)
    item_id = Column(String, ForeignKey("items.item_id"), nullable=False)


class Store(Base):
    __tablename__ = "stores"

    store_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=False)
    phone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class StoreOwners(Base):
    __tablename__ = "store_owners"

    store_owners_id = Column(String, primary_key=True)
    store_id = Column(String, ForeignKey("stores.store_id"), nullable=False)
    owner_id = Column(String, ForeignKey("users.user_id"), nullable=False)


class Item(Base):
    __tablename__ = "items"

    item_id = Column(String, primary_key=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String)
    price = Column(Numeric(10,2), nullable=False, index=True)
    picture = Column(String)
    store_id = Column(String, ForeignKey("stores.store_id"), nullable=False)
    info_id = Column(String, ForeignKey("item_info.item_info_id"))

    orders = relationship(
        "Order",
        secondary="user_orders",
        back_populates="items"
    )


class ItemInfo(Base):
    __tablename__ = "item_info"

    item_info_id = Column(String, primary_key=True, index=True, nullable=False)
    serving_size = Column(String)
    calories = Column(Integer)
    total_fat = Column(String)
    cholesterol = Column(String)
    sodium = Column(String)
    carbs = Column(String)
    dietary_fiber = Column(String)
    total_sugars = Column(String)
    added_sugars = Column(String)
    protein = Column(String)
    ingredients = Column(String)

class Pickups(Base):
    __tablename__ = "pickups"

    pickups_id = Column(String, primary_key=True, index=True, nullable=False)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False)
    dasher_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime, default=None)

class Reports(Base):
    __tablename__ = "reports"

    report_id = Column(String, primary_key=True, nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False)
    dasher_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    comment = Column(String, nullable=False)





