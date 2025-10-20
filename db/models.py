from sqlalchemy import Column, Integer, Numeric, Boolean, String, DateTime, ForeignKey, Enum as SqlEnum, func
from sqlalchemy.orm import relationship
import uuid
from database import Base
import enum

class UserRole(enum.Enum):
    admin = "admin"
    store_owner = "store_owner"
    dasher = "dasher"
    user = "user"

class OrderStatus(enum.Enum):
    initialized = "initialized" # Order just created in cart but not paid for
    pending = "pending" # Order has been paid for and waiting to be picked by a dasher
    accepted = "accepted" # Order has been picked by a dasher
    completed = "completed" # Delivery was completed.
    dropped = "dropped" # Order was picked up but delivery was not completed.


class ItemType(enum.Enum):
    entree = "entree"
    side = "side"
    drink = "drink"
    dessert = "dessert"
    other = "other"


class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    campus_id = Column(String, nullable=False, unique=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    password = Column(String, nullable=False)
    first_name = Column(String, nullable=False, index=True)
    last_name = Column(String)
    role = Column(SqlEnum(UserRole), nullable=False, default=UserRole.user)
    is_banned = Column(Boolean, nullable=False, default=False)
    orders = relationship("Order", back_populates="user")
    addresses = relationship("Address", back_populates="user")
    pickups = relationship("Pickups", back_populates="user")
    reports = relationship("Reports", back_populates="user")


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    address = Column(String, nullable=False)
    status = Column(SqlEnum(OrderStatus), nullable=False, default=OrderStatus.initialized)
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

    user_items_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False)
    item_id = Column(String, ForeignKey("items.item_id"), nullable=False)


class Store(Base):
    __tablename__ = "stores"

    store_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=False)
    phone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class StoreOwners(Base):
    __tablename__ = "store_owners"

    store_owners_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    store_id = Column(String, ForeignKey("stores.store_id"), nullable=False)
    owner_id = Column(String, ForeignKey("users.user_id"), nullable=False)


class Item(Base):
    __tablename__ = "items"

    item_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    name = Column(String, nullable=False, index=True)
    item_type = Column(SqlEnum(ItemType), nullable=False)
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

    item_info_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
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

    pickups_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False)
    dasher_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime, default=None)

class Reports(Base):
    __tablename__ = "reports"

    report_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False, unique=True)
    dasher_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    comment = Column(String, nullable=False)

class Address(Base):
    __tablename__ = "addresses"

    user_id = Column(String, ForeignKey("users.user_id"), nullable=False, primary_key=True)
    address_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    street = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip = Column(String, nullable=False)





