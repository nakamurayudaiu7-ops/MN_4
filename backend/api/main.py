import json
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import ValidationError

from backend.api.schemas.system import System
from backend.api.routers import message, posts


def load_system(app: FastAPI) -> None:
    try:
        with open("data.json", "rt", encoding="utf-8") as f:
            data_dict = json.load(f)
            app.state.system = System.model_validate(data_dict)
    except (FileNotFoundError, ValidationError):
        app.state.system = System()


async def save_system(app: FastAPI) -> None:
    with open("data.json", "wt", encoding="utf-8") as f:
        f.write(app.state.system.model_dump_json(indent=4))


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_system(app)
    yield
    await save_system(app)


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
        "null",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=HTMLResponse)
async def get_client():
    """Return client HTML"""
    data = ''
    with open('client.html', 'rt', encoding='utf-8') as f:
        data = f.read()
    return data


app.include_router(message.router)
app.include_router(posts.router)
