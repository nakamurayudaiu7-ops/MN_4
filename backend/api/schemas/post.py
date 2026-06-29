from datetime import datetime
from pydantic import BaseModel, Field

class PostBase(BaseModel):
    author: str = Field(...,
                        examples=["山田太郎"],
                        description="投稿者名")
    content: str = Field(...,
                         examples=["課題終わらせた！"],
                         description="投稿内容")
    category: str | None = Field(None,
                                 examples=["宿題", "筋トレ"],
                                 description="投稿カテゴリ")
    images: list[str] = Field(default_factory=list,
                             examples=["https://example.com/img1.jpg"],
                             description="画像URLの配列")


class Post(PostBase):
    id: int = Field(..., description="投稿ID")
    profileImage: str | None = Field(
        None, description="プロフィール画像のURLまたはイニシャル"
    )
    likes_count: int = Field(0,
                             examples=[0, 5],
                             description="いいね数")
    created_at: datetime = Field(...,
                                description="作成日時 (ISO 8601, UTC)")


class PostResponse(BaseModel):
    posts: list[Post] = Field(default_factory=list,
                              description="投稿一覧",
                              examples=[{
                                  "id": 1,
                                  "author": "山田太郎",
                                  "profileImage": "https://example.com/user1.jpg",
                                  "content": "課題終わらせた！",
                                  "category": "宿題",
                                  "images": [],
                                  "likes_count": 5,
                                  "created_at": "2024-06-15T10:30:00Z"
                              }])

# リクエスト用にわかりやすい別名を用意
PostCreate = PostBase