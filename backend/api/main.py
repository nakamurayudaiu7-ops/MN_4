import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from backend.api.database import UPLOAD_DIR
from backend.api.routers import message


app = FastAPI()

frontend_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/", response_class=HTMLResponse)
async def get_client():
    """Return client HTML"""
    with open("client.html", "rt", encoding="utf-8") as handle:
        return handle.read()


app.include_router(message.router)
app.include_router(posts.router)
