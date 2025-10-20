from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from db_setup import create_db
from api.routers import user
from api.auth import auth

app = FastAPI(
    title="Your API",
    description="Your API Description",
    version="1.0.0"
)

# Include all your routers
app.include_router(user.router, prefix="/api/users", tags=["users"])

app.include_router(auth.router, prefix="/api/auth", tags=["token"])

@app.on_event("startup")
def startup_event():
    create_db()

@app.get("/")
async def root():
    return {"message": "Hello World"}

