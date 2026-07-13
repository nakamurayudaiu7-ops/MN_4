from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from backend.api.database import (
    authenticate_user,
    create_post,
    create_session,
    create_user,
    delete_post,
    get_user_from_token,
    like_post,
    list_notifications,
    list_posts,
)

router = APIRouter()


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=24)
    password: str = Field(..., min_length=4)
    display_name: str = Field(..., min_length=1, max_length=24)


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=24)
    password: str = Field(..., min_length=4)


class PostCreateRequest(BaseModel):
    content: str = Field(..., min_length=1)
    category: str | None = None
    images: list[str] = Field(default_factory=list)


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="token required")
    token = authorization.split(" ", 1)[1]
    user = get_user_from_token(token)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")
    return user


@router.post("/api/auth/register")
async def register(request: RegisterRequest):
    try:
        user = create_user(request.username, request.password, request.display_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    token = create_session(user["id"])
    return {"token": token, "user": user}


@router.post("/api/auth/login")
async def login(request: LoginRequest):
    user = authenticate_user(request.username, request.password)
    if user is None:
        raise HTTPException(status_code=401, detail="invalid username or password")
    token = create_session(user["id"])
    return {"token": token, "user": user}


@router.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.get("/api/posts")
async def get_posts(username: str | None = None):
    return {"posts": list_posts(username)}


@router.post("/api/posts", status_code=201)
async def create_message(request: PostCreateRequest, current_user: dict = Depends(get_current_user)):
    post = create_post(current_user["id"], request.content, request.category, request.images)
    return post


@router.post("/api/posts/upload", status_code=201)
async def upload_images(files: list[UploadFile] = File(...), current_user: dict = Depends(get_current_user)):
    urls: list[str] = []
    for file in files:
        content = await file.read()
        import base64
        encoded = base64.b64encode(content).decode("ascii")
        urls.append(f"data:{file.content_type or 'image/png'};base64,{encoded}")
    return {"images": urls}


@router.post("/api/posts/{message_id}/like")
async def post_like(message_id: int, current_user: dict = Depends(get_current_user)):
    try:
        return like_post(message_id, current_user["id"])
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="message not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/api/posts/{message_id}")
async def delete_message(message_id: int, current_user: dict = Depends(get_current_user)):
    try:
        delete_post(message_id, current_user["id"])
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="message not found") from exc
    return {"ok": True}


@router.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    return {"notifications": list_notifications(current_user["id"])}


@router.get("/api/categories")
async def get_categories():
    posts = list_posts()
    categories = sorted({post["category"] for post in posts if post.get("category")})
    return {"categories": categories}
