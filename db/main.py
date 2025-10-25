from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from db_setup import create_db
from api.routers import user
from api.auth import auth
from api.routers import admin
from api.routers import order
from api.routers import pickups
from utils import BaseFactory


app = FastAPI(
    title="Your API",
    description="Your API Description",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
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

# Explicit OPTIONS handler
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return Response(status_code=200)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Method: {request.method}, Path: {request.url.path}")
    print(f"Headers: {request.headers}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

