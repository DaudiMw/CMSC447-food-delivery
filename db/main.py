from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db_setup import create_db
from api.routers import user
from api.auth import auth
from api.routers import admin
from api.routers import order
from api.routers import pickups

app = FastAPI(
    title = "Your API",
    description = "Your API Description",
    version = "1.0.0"
)

# Include all your routers
app.include_router(user.router, tags=["users"])

app.include_router(auth.router, tags=["token"])

app.include_router(admin.router, tags=["admin"])

app.include_router(order.router, tags=["orders"])

app.include_router(pickups.router, tags=["pickups"])

@app.on_event("startup")
def startup_event():
    create_db()

@app.get("/")
async def root():
    return {"message": "Hello World"}

