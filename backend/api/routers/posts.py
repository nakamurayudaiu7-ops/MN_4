#added
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request

from backend.api.schemas.post import Post, PostBase, PostResponse

router = APIRouter(prefix="/api", tags=["posts"])


def _get_posts(request: Request) -> list[Post]:
    if not hasattr(request.app.state, "posts"):
        request.app.state.posts = []
    return request.app.state.posts


def _get_next_post_id(request: Request) -> int:
    if not hasattr(request.app.state, "next_post_id"):
        request.app.state.next_post_id = 1
    post_id = request.app.state.next_post_id
    request.app.state.next_post_id += 1
    return post_id


@router.get("/posts", response_model=PostResponse)
async def get_posts(request: Request):
    """投稿一覧を取得する"""
    posts = _get_posts(request)
    return PostResponse(posts=posts)


@router.post("/posts", response_model=Post)
async def create_post(post_data: PostBase, request: Request):
    """新しい投稿を作成する"""
    posts = _get_posts(request)
    new_post = Post(
        id=_get_next_post_id(request),
        author=post_data.author,
        profileImage=None,
        content=post_data.content,
        category=post_data.category,
        images=list(post_data.images),
        likes_count=0,
        created_at=datetime.now(timezone.utc),
    )
    posts.insert(0, new_post)
    return new_post


@router.post("/posts/{post_id}/like")
async def like_post(post_id: int, request: Request):
    """指定した投稿のいいね数を増やす"""
    posts = _get_posts(request)
    for post in posts:
        if post.id == post_id:
            post.likes_count += 1
            return {"id": post.id, "likes_count": post.likes_count}

    raise HTTPException(status_code=404, detail="Post not found")
