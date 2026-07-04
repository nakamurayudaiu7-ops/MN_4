from datetime import datetime
from pydantic import BaseModel, Field
from .post import Post

class System(BaseModel):
    current_id: int = Field(0, description="Current (latest) ID")
    posts: dict[int, Post] = Field(default_factory=dict)


class Response(System):
    current_time: datetime | None = Field(None,
                                          description="Current server time")
    ids: list[int] = Field(default_factory=list)

