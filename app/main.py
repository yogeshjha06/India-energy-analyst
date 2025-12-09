from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import npp, gargi

app = FastAPI(
    title="India Energy API",
    version="1.0",
    description="Unified API for Indian energy datasets."
)

# Allow your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your website URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Routers
app.include_router(npp.router)
app.include_router(gargi.router)

@app.get("/")
async def root():
    return {"message": "India Energy API is running!"}

@app.head("/")
async def root_head():
    return {}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.head("/health")
async def health_head():
    return {}

@app.get("/dashboard")
async def dashboard():
    return FileResponse("app/static/dashboard.html")