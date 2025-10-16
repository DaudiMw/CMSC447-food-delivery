from database import engine, Base
from models import *


def create_db():
    """Create the database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")




