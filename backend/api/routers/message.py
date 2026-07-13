#done
#いいねの押下とその数の取得
#投稿
#カテゴリ分けは数種類
#カテゴリをユーザが記入できる

#to do
#自分の投稿を見れるように
#ユーザー認証　または　投稿の削除

#DBのSQLite化
#コメント機能
#グループ作成

from datetime import datetime
from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Depends

from backend.api.db import get_system
from backend.api.schemas.system import System, Response
from backend.api.schemas.post import Post,PostBase

router = APIRouter()


@router.get("/api/posts", response_model=Response)
async def get_messages(system: System = Depends(get_system),
                       from_id: int | None = 1, to_id: int | None = None,
                       from_time: datetime | None = None,
                       category: str | None = None,
                       ids_only: bool = False):
    """全ての message を返す"""
    if from_id is None or from_id < 1:
        from_id = 1
    if to_id is None:
        # to_id が指定されない場合は，現在の最大IDまで取得する．
        to_id = system.current_id
    l: list = []
    for i in range(from_id, to_id + 1):
        if i in system.posts:
            if from_time is None or from_time <= system.posts[i].created_at:
                if category is None:
                    l.append(i)
                elif system.posts[i].category == category:
                    l.append(i)

    # ID のリストのみ返す
    if ids_only:
        return Response(
            current_id=system.current_id,
            current_time=datetime.now(),
            ids=l)
    return Response(
        current_id=system.current_id,
        current_time=datetime.now(),
        posts={i: system.posts[i] for i in l})


@router.get("/api/posts/current_id")
async def get_messages_current_id(system: System = Depends(get_system)):
    return {"current_id": system.current_id}


@router.post("/api/posts", response_model=Post)
async def post_message(message: PostBase,
                       system: System = Depends(get_system)):
    """message のPOST"""
    next_id = system.current_id + 1
    now = datetime.now()
    m = Post(
        id=next_id,
        created_at=now,
        likes_count=0,
        **message.model_dump(),
    )
    system.posts[next_id] = m
    system.current_id = next_id
    print(m)
    return m


@router.get("/api/posts/{message_id}", response_model=Post)
async def get_message(message_id: int,
                      system: System = Depends(get_system), ):
    """個別 message のGET"""
    # 該当 ID の message が存在しない場合は 404 を返す(他の関数でも同様)
    if message_id not in system.posts:
        raise HTTPException(status_code=404,
                            detail="Message cannot be found")
    
    return system.posts[message_id]

@router.post('/api/posts/{message_id}/like')
async def post_like(message_id: int,
                    system:System = Depends(get_system)):
    if message_id not in system.posts:
        raise HTTPException(status_code=404,
        detail="Message cannot be found")
    
    m = system.posts[message_id]
    m.likes_count +=1
    return m
