from sqlalchemy import Column, String, Numeric, Boolean, String, Integer, DateTime, ForeignKey, Time, Enum as SqlEnum, func
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

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False, unique=True, server_default=func.uuid_generate_v4(), index=True)
    campus_id = Column(String, nullable=False, unique=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    password = Column(String, nullable=False)
    first_name = Column(String, nullable=False, index=True)
    last_name = Column(String)
    role = Column(SqlEnum(UserRole), nullable=False, default=UserRole.user)
    is_banned = Column(Boolean, nullable=False, default=False)
    
    # Relationships
    orders = relationship("Order", back_populates="user") #1 to many
    addresses = relationship("Address", back_populates="users") #1 to many
    pickups = relationship("Pickups", back_populates="dasher") #1 to many
    reports = relationship("Reports", back_populates="user") #1 to many
    stores = relationship("Store", secondary="store_owners", back_populates="owners") #many to many


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String)
    picture = Column(String)
    phone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    address = relationship("Address", back_populates="store", uselist=False) #1 to 1
    hours = relationship("StoreHours", back_populates="store", uselist=False) #1 to 1
    items = relationship("Item", back_populates="store") #1 to many
    owners = relationship("User", secondary="store_owners", back_populates="stores") #many to many
    orders = relationship("Order", back_populates="store")
    pickups = relationship("Pickups", back_populates="store")
    reports = relationship("Reports", back_populates="store")


class StoreHours(Base):
    __tablename__ = "store_hours"

    id = Column(Integer, primary_key=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    monday_hours = Column(Time, nullable=True)
    tuesday_hours = Column(Time, nullable=True)
    wednesday_hours = Column(Time, nullable=True)
    thursday_hours = Column(Time, nullable=True)
    friday_hours = Column(Time, nullable=True)
    saturday_hours = Column(Time, nullable=True)
    sunday_hours = Column(Time, nullable=True)

    store = relationship("Store", back_populates="hours", uselist=False) #1 to 1


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    item_type = Column(SqlEnum(ItemType), nullable=False)
    description = Column(String)
    price = Column(Numeric(10,2), nullable=False, index=True)
    picture = Column(String)

    # Relationships
    item_info = relationship("ItemInfo", back_populates="item", uselist=False) #1 to 1
    orders = relationship("Order", secondary="user_orders", back_populates="items") #many to many
    store = relationship("Store", back_populates="items") #many to 1


class ItemInfo(Base):
    __tablename__ = "item_info"

    id = Column(Integer, primary_key=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    serving_size = Column(String)
    calories = Column(String)
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
    item = relationship("Item", back_populates="item_info", uselist=False) #1 to 1


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    address = Column(String, nullable=False)
    status = Column(SqlEnum(OrderStatus), nullable=False, default=OrderStatus.initialized)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("Item", secondary="user_orders", back_populates="orders")
    pickups = relationship("Pickups", back_populates="order") #1 to many
    reports = relationship("Reports", back_populates="order") #1 to many
    store = relationship("Store", back_populates="orders") #many to 1


class Pickups(Base):
    __tablename__ = "pickups"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    dasher_id = Column(String, ForeignKey("users.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime, default=None)
    
    # Relationships
    order = relationship("Order", back_populates="pickups") #many to 1
    dasher = relationship("User", back_populates="pickups") #many to 1
    store = relationship("Store", back_populates="pickups") #many to 1


class Reports(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    comment = Column(String, nullable=False)
    response = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="reports") #many to 1
    order = relationship("Order", back_populates="reports") #many to 1
    store = relationship("Store", back_populates="reports") #many to 1
    # Note: dasher relationship might need special handling since it's also a User


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    store_id = Column(Integer, ForeignKey("stores.id"))
    street = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip = Column(String, nullable=False)
    label = Column(String)
    
    # Relationships
    users = relationship("User", back_populates="addresses") #many to 1
    store = relationship("Store", back_populates="address", uselist=False) #1 to 1


class DasherApplications(Base):
    __tablename__ = "dasher_applications"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    content = Column(String, nullable=False)
    date_applied = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


#Association table
class OrderItems(Base):
    __tablename__ = "user_orders"

    id = Column(Integer, primary_key=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    item_id = Column(String, ForeignKey("items.id"), nullable=False)


#Association table
class StoreOwners(Base):
    __tablename__ = "store_owners"

    id = Column(Integer, primary_key=True)
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)