from sqlalchemy import Column, Integer, Numeric, Boolean, BLOB, String, DateTime, ForeignKey, Enum as SqlEnum, func
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
    
    # Relationships
    orders = relationship("Order", back_populates="user", foreign_keys="Order.user_id")
    addresses = relationship("Address", back_populates="user")
    pickups = relationship("Pickups", back_populates="dasher", foreign_keys="Pickups.dasher_id")
    reports_made = relationship("Reports", back_populates="user", foreign_keys="Reports.user_id")
    store_ownerships = relationship("StoreOwners", back_populates="owner")


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    address = Column(String, nullable=False)
    status = Column(SqlEnum(OrderStatus), nullable=False, default=OrderStatus.initialized)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("Item", secondary="user_orders", back_populates="orders")
    pickups = relationship("Pickups", back_populates="order")
    reports = relationship("Reports", back_populates="order")


class OrderItems(Base):
    __tablename__ = "user_orders"

    user_items_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False)
    item_id = Column(String, ForeignKey("items.item_id"), nullable=False)


class Store(Base):
    __tablename__ = "stores"

    store_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    name = Column(String, nullable=False, index=True)
    address_id = Column(ForeignKey("addresses.address_id"), nullable=False)
    description = Column(String)
    picture_id = Column(String, ForeignKey("media.media_id"))
    phone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    items = relationship("Item", back_populates="store")
    owners = relationship("StoreOwners", back_populates="store")


class StoreOwners(Base):
    __tablename__ = "store_owners"

    store_owners_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    store_id = Column(String, ForeignKey("stores.store_id"), nullable=False)
    owner_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    
    # Relationships
    store = relationship("Store", back_populates="owners")
    owner = relationship("User", back_populates="store_ownerships")


class Item(Base):
    __tablename__ = "items"

    item_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    name = Column(String, nullable=False, index=True)
    item_type = Column(SqlEnum(ItemType), nullable=False)
    description = Column(String)
    price = Column(Numeric(10,2), nullable=False, index=True)
    picture_id = Column(String, ForeignKey("media.media_id"))
    store_id = Column(String, ForeignKey("stores.store_id"), nullable=False)
    info_id = Column(String, ForeignKey("item_info.item_info_id"))

    # Relationships
    orders = relationship("Order", secondary="user_orders", back_populates="items")
    store = relationship("Store", back_populates="items")
    nutrition_info = relationship("ItemInfo", back_populates="items")


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
    
    # Relationships
    items = relationship("Item", back_populates="nutrition_info")


class Pickups(Base):
    __tablename__ = "pickups"

    pickups_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False)
    dasher_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime, default=None)
    
    # Relationships
    order = relationship("Order", back_populates="pickups")
    dasher = relationship("User", back_populates="pickups")


class Reports(Base):
    __tablename__ = "reports"

    report_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False, unique=True)
    dasher_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    comment = Column(String, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="reports_made", foreign_keys=[user_id])
    order = relationship("Order", back_populates="reports")
    # Note: dasher relationship might need special handling since it's also a User


class Address(Base):
    __tablename__ = "addresses"

    address_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    user_id = Column(String, ForeignKey("users.user_id"))
    street = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip = Column(String, nullable=False)
    label = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="addresses")

class DasherApplications(Base):
    __tablename__ = "dasher_applications"

    application_id = Column(String, primary_key=True, default= lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False, unique=True)
    content = Column(String, nullable=False)
    date_applied = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Media(Base):
    __tablename__ = "media"
    media_id = Column(String, primary_key=True, default= lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    media_data = Column(BLOB, nullable=False)
    filename = Column(String, nullable=False)
