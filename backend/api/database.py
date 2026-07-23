import base64
import hashlib
import json
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "data" / "app.db"
UPLOAD_DIR = BASE_DIR / "uploads"


def ensure_db() -> Path:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                display_name TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                category TEXT,
                images_json TEXT NOT NULL DEFAULT '[]',
                likes_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE(post_id, user_id),
                FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                post_id INTEGER,
                notification_type TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
            );
            """
        )

    return DB_PATH


ensure_db()


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def hash_password(password: str) -> str:
    salt = secrets.token_hex(8)
    digest = hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()
    return f"{salt}${digest}"


def verify_password(password: str, password_hash: str) -> bool:
    if not password_hash or "$" not in password_hash:
        return False
    salt, digest = password_hash.split("$", 1)
    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest() == digest


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def create_user(username: str, password: str, display_name: str) -> dict[str, Any]:
    with get_connection() as conn:
        existing = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if existing is not None:
            raise ValueError("username already exists")
        created_at = now_iso()
        cursor = conn.execute(
            "INSERT INTO users (username, password_hash, display_name, created_at) VALUES (?, ?, ?, ?)",
            (username, hash_password(password), display_name, created_at),
        )
        user_id = int(cursor.lastrowid)
        return {
            "id": user_id,
            "username": username,
            "display_name": display_name,
            "created_at": created_at,
        }


def authenticate_user(username: str, password: str) -> dict[str, Any] | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, username, password_hash, display_name, created_at FROM users WHERE username = ?",
            (username,),
        ).fetchone()
    if row is None:
        return None
    if not verify_password(password, row["password_hash"]):
        return None
    return {
        "id": row["id"],
        "username": row["username"],
        "display_name": row["display_name"],
        "created_at": row["created_at"],
    }


def create_session(user_id: int) -> str:
    token = secrets.token_hex(24)
    expires_at_dt = datetime.now(timezone.utc) + timedelta(days=7)
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO sessions (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)",
            (user_id, token, now_iso(), expires_at_dt.replace(microsecond=0).isoformat()),
        )
    return token


def get_user_from_token(token: str) -> dict[str, Any] | None:
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT u.id, u.username, u.display_name, u.created_at
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ? AND s.expires_at > ?
            """,
            (token, now_iso()),
        ).fetchone()
    if row is None:
        return None
    return {
        "id": row["id"],
        "username": row["username"],
        "display_name": row["display_name"],
        "created_at": row["created_at"],
    }


def save_image(image_value: str, post_id: int, index: int) -> str:
    if image_value.startswith("http://") or image_value.startswith("https://"):
        return image_value
    if not image_value.startswith("data:image/"):
        return image_value

    header, payload = image_value.split(",", 1)
    mime_type = header.split(":", 1)[1].split(";", 1)[0]
    extension = mime_type.split("/", 1)[1] if "/" in mime_type else "png"
    filename = f"post_{post_id}_{index}_{secrets.token_hex(4)}.{extension}"
    path = UPLOAD_DIR / filename
    with path.open("wb") as handle:
        handle.write(base64.b64decode(payload))
    return f"/uploads/{filename}"


def create_post(user_id: int, content: str, category: str | None, images: list[str]) -> dict[str, Any]:
    created_at = now_iso()
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO posts (user_id, content, category, images_json, likes_count, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, content, category, json.dumps(images), 0, created_at),
        )
        post_id = int(cursor.lastrowid)
        saved_images = [save_image(image, post_id, index) for index, image in enumerate(images)]
        conn.execute(
            "UPDATE posts SET images_json = ? WHERE id = ?",
            (json.dumps(saved_images), post_id),
        )
        row = conn.execute(
            """
            SELECT p.id, p.user_id, p.content, p.category, p.images_json, p.likes_count, p.created_at,
                   u.username, u.display_name
            FROM posts p
            JOIN users u ON u.id = p.user_id
            WHERE p.id = ?
            """,
            (post_id,),
        ).fetchone()
    return serialize_post(row)


def list_posts(username: str | None = None) -> list[dict[str, Any]]:
    query = """
        SELECT p.id, p.user_id, p.content, p.category, p.images_json, p.likes_count, p.created_at,
               u.username, u.display_name
        FROM posts p
        JOIN users u ON u.id = p.user_id
    """
    params: list[Any] = []
    if username:
        query += " WHERE u.username = ?"
        params.append(username)
    query += " ORDER BY p.created_at DESC, p.id DESC"
    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
    return [serialize_post(row) for row in rows]


def like_post(post_id: int, user_id: int) -> dict[str, Any]:
    with get_connection() as conn:
        post_row = conn.execute("SELECT user_id, likes_count FROM posts WHERE id = ?", (post_id,)).fetchone()
        if post_row is None:
            raise KeyError("post not found")
        if conn.execute("SELECT id FROM likes WHERE post_id = ? AND user_id = ?", (post_id, user_id)).fetchone() is not None:
            raise ValueError("already liked")
        conn.execute("INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)", (post_id, user_id, now_iso()))
        conn.execute("UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?", (post_id,))

        owner_row = conn.execute(
            "SELECT username, display_name FROM users WHERE id = ?",
            (post_row["user_id"],),
        ).fetchone()
        liker_row = conn.execute(
            "SELECT username, display_name FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
        post_content_row = conn.execute(
            "SELECT content FROM posts WHERE id = ?",
            (post_id,),
        ).fetchone()
        if owner_row is not None and liker_row is not None:
            receiver_id = post_row["user_id"]
            liker_name = liker_row["display_name"] or liker_row["username"]
            content = post_content_row["content"] if post_content_row else ""
            preview = content[:20] + ("..." if len(content) > 20 else "")
            message = f'{liker_name}さんがあなたの投稿「{preview}」にいいねしました'
            conn.execute(
                "INSERT INTO notifications (user_id, post_id, notification_type, message, created_at) VALUES (?, ?, ?, ?, ?)",
                (
                    receiver_id,
                    post_id,
                    "like",
                    message,
                    now_iso(),
                ),
            )

        conn.commit()
        updated_row = conn.execute(
            "SELECT p.id, p.user_id, p.content, p.category, p.images_json, p.likes_count, p.created_at, u.username, u.display_name FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?",
            (post_id,),
        ).fetchone()
    return serialize_post(updated_row)


def list_notifications(user_id: int) -> list[dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, post_id, notification_type, message, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
    return [
        {
            "id": row["id"],
            "post_id": row["post_id"],
            "notification_type": row["notification_type"],
            "message": row["message"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def delete_post(post_id: int, user_id: int) -> None:
    with get_connection() as conn:
        row = conn.execute("SELECT id FROM posts WHERE id = ? AND user_id = ?", (post_id, user_id)).fetchone()
        if row is None:
            raise KeyError("post not found")
        conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        conn.commit()


def serialize_post(row: sqlite3.Row) -> dict[str, Any]:
    images = []
    if row["images_json"]:
        try:
            images = json.loads(row["images_json"])
        except json.JSONDecodeError:
            images = []
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "author": row["display_name"] or row["username"],
        "author_username": row["username"],
        "display_name": row["display_name"] or row["username"],
        "profileImage": (row["display_name"] or row["username"] or "U")[0].upper(),
        "content": row["content"],
        "category": row["category"],
        "images": images,
        "likes_count": row["likes_count"],
        "created_at": row["created_at"],
    }
