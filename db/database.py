import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, Boolean, Column, text
from sqlalchemy.orm import sessionmaker, declarative_base, DeclarativeBase


# Get the project root directory
basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Load environment variables from the .env file in the root
load_dotenv(os.path.join(basedir, '.env'))


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

# 
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

print("Using SQLite DB at:", Path(DATABASE_URL.replace("sqlite:///", "")).resolve())



print("DB absolute path:", engine.url.database)

"""with engine.connect() as conn:
    rows = conn.execute(text('SELECT * FROM users')).fetchall()
    print("rows in db:", len(rows))
    print(rows[:3])"""


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class CustomBase(object):
    is_deleted = Column(Boolean, nullable=False, default=False)

Base = declarative_base(cls=CustomBase)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()