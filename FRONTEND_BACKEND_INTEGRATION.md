# フロントエンド・バックエンド統合ガイド

フロントエンドとバックエンドが連携するための仕様書です。
**両チームで確認してから実装を進めてください。**

---

## 📌 データモデル

### Post インターフェース（フロント定義）

```typescript
export interface Post {
  id: number;                  // 投稿ID
  author: string;              // ユーザー名
  profileImage: string;        // プロフィール画像（URL or イニシャル）
  content: string;             // 投稿内容
  category?: string;           // カテゴリ（筋トレ、宿題、家事など）
  images?: string[];           // 画像URL配列
  likes_count: number;         // いいね数
  created_at: string;          // 作成日時（ISO 8601形式推奨）
}
```

**バックエンド側で対応するフィールド：**
- `id` ← データベース主キー
- `author` ← ユーザーテーブルから取得
- `profileImage` ← users.profile_image_url
- `content` ← posts.content
- `category` ← posts.category または categories テーブル
- `images` ← post_images テーブルから配列生成
- `likes_count` ← COUNT(likes)
- `created_at` ← posts.created_at

---

## 🔌 API エンドポイント（必須）

### 1️⃣ タイムライン取得

```http
GET /api/posts
```

**リクエスト：**
```bash
curl http://localhost:8000/api/posts
```

**レスポンス例：**
```json
{
  "posts": [
    {
      "id": 1,
      "author": "山田太郎",
      "profileImage": "https://example.com/user1.jpg",
      "content": "課題終わらせた！",
      "category": "宿題",
      "images": [],
      "likes_count": 5,
      "created_at": "2024-06-15T10:30:00Z"
    }
  ]
}
```

**フロント実装予定：**
```typescript
useEffect(() => {
  fetch("/api/posts")
    .then(res => res.json())
    .then(data => setPosts(data.posts))
}, [])
```

---

### 2️⃣ 新規投稿

```http
POST /api/posts
```

**リクエストボディ：**
```json
{
  "author": "山田太郎",
  "content": "課題終わらせた！",
  "category": "宿題",
  "images": []
}
```

**レスポンス例：**
```json
{
  "id": 2,
  "author": "山田太郎",
  "profileImage": "https://example.com/user1.jpg",
  "content": "課題終わらせた！",
  "category": "宿題",
  "images": [],
  "likes_count": 0,
  "created_at": "2024-06-15T10:35:00Z"
}
```

**フロント実装予定：**
```typescript
const handleAddPost = (content: string) => {
  fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      author: "あなた",
      content,
      category: "宿題"
    })
  })
  .then(res => res.json())
  .then(newPost => setPosts([newPost, ...posts]))
}
```

---

### 3️⃣ いいね追加

```http
POST /api/posts/{id}/like
```

**リクエスト：**
```bash
curl -X POST http://localhost:8000/api/posts/1/like
```

**レスポンス例：**
```json
{
  "id": 1,
  "likes_count": 6
}
```

**フロント実装予定：**
```typescript
const handleLike = (id: number) => {
  fetch(`/api/posts/${id}/like`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      setPosts(posts.map(post =>
        post.id === id ? { ...post, likes_count: data.likes_count } : post
      ))
    })
}
```

---

### 4️⃣ カテゴリ一覧取得

```http
GET /api/categories
```

**レスポンス例：**
```json
{
  "categories": ["筋トレ", "宿題", "家事"]
}
```

**フロント実装予定（後々）：**
```typescript
// Timeline.tsx の CATEGORIES ハードコード を削除し、
// バックエンドから動的に取得する
const [categories, setCategories] = useState<string[]>([]);

useEffect(() => {
  fetch("/api/categories")
    .then(res => res.json())
    .then(data => setCategories(data.categories))
}, [])
```

---

## 🗂️ データベーススキーマ（バックエンド参考）

バックエンド側で作成推奨のテーブル：

```sql
-- ユーザーテーブル
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  profile_image_url VARCHAR(255),
  created_at TIMESTAMP
);

-- 投稿テーブル
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  content TEXT,
  category_id INT,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- カテゴリテーブル
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE,
  created_at TIMESTAMP
);

-- いいねテーブル
CREATE TABLE likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT,
  user_id INT,
  created_at TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 投稿画像テーブル
CREATE TABLE post_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT,
  image_url VARCHAR(255),
  created_at TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);
```

---

## 📋 チェックリスト

### フロントエンド側
- [ ] POST 型定義が確定
- [ ] API URL を環境変数で管理（後々）
- [ ] エラーハンドリング（404, 500など）
- [ ] ローディング状態の表示

### バックエンド側
- [ ] POST テーブル設計
- [ ] `GET /api/posts` 実装
- [ ] `POST /api/posts` 実装
- [ ] `POST /api/posts/{id}/like` 実装
- [ ] `GET /api/categories` 実装
- [ ] CORS設定（フロント側 localhost:3000 をホワイトリスト）

---

## ⚠️ 注意点

1. **日時形式**
   - フロント: `created_at: "2024-06-15T10:30:00Z"` (ISO 8601)
   - バック: 必ず UTC で返す

2. **CORS対応**
   - バックエンドは `Access-Control-Allow-Origin: http://localhost:3000` を設定

3. **認証**
   - 現在: 認証なし（ダミーユーザー）
   - 将来: JWT や セッションベース認証を追加

4. **エラーレスポンス**
   ```json
   {
     "error": "エラーメッセージ",
     "status": 400
   }
   ```

---

## 🚀 開発フロー

```
Week 1-2: 環境構築
  フロント: コンポーネント設計 ✅完了
  バック: テーブル設計 & API スタブ作成

Week 2-3: API開発
  バック: 実装進行
  フロント: ダミーデータ で UI 検証

Week 4: 統合
  フロント: API からのデータ取得に切り替え
  バック: バグ修正

Week 5: テスト & デプロイ
```

---

## 📞 質問・不明な点

- フロント: `frontend/README.md` 参照
- バック: `backend/README.md` 参照
- 全体: ルートの `README.md` 参照
