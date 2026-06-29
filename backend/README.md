# Backend README

## 🚀 バックエンド担当のこれからの流れ

このREADMEはバックエンドチームがやるべきことを整理したものです。
フロントエンドと連携するために、まずは「何を実装するか」「どの順番で進めるか」を共通認識にします。

---

## 1. 参照すべき統合ドキュメント

- `FRONTEND_BACKEND_INTEGRATION.md` の API 定義を最優先で反映
- `frontend/README.md` にも API 連携例がある
- ルートの `README.md` で必須機能の全体像を確認

---

## 2. 現状の確認

- `backend/api/main.py` で FastAPI アプリを起動
- `backend/api/routers/message.py` でメッセージ系の CRUD API を定義
- `backend/api/schemas/` に Pydantic スキーマあり
- `backend/api/db.py` でリクエストから `System` を取得
- `data.json` へ保存/読み込みする仕組みがある

> まずは現状の API 仕様を把握し、フロントが期待するエンドポイントとデータ形式を照らし合わせてください。

---

## 3. フロントが期待する API 仕様

### 3.1 データモデル

フロント側で使われる `Post` の想定フィールド：
- `id`: 数値
- `author`: ユーザー名
- `profileImage`: 画像 URL またはイニシャル
- `content`: 投稿内容
- `category`: カテゴリ名（例: 筋トレ、宿題、家事）
- `images`: 画像URL配列
- `likes_count`: いいね数
- `created_at`: ISO 8601 形式の日付文字列

### 3.2 必須 API

#### `GET /api/posts`
- 目的: タイムライン取得
- レスポンス例:
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

#### `POST /api/posts`
- 目的: 新規投稿
- リクエストボディ例:
  ```json
  {
    "author": "山田太郎",
    "content": "課題終わらせた！",
    "category": "宿題",
    "images": []
  }
  ```
- レスポンス例: 作成した投稿オブジェクト

#### `POST /api/posts/{id}/like`
- 目的: いいね追加
- レスポンス例:
  ```json
  {
    "id": 1,
    "likes_count": 6
  }
  ```

#### `GET /api/categories`
- 目的: カテゴリ一覧取得
- レスポンス例:
  ```json
  {
    "categories": ["筋トレ", "宿題", "家事"]
  }
  ```

---

## 4. 重要タスクと優先順位

1. **API 仕様のすり合わせ**
   - フロントが期待するエンドポイント名と JSON 形式を確定する
   - 現状の `/messages` 系 API を `posts` API に合わせて整理する

2. **データモデル・スキーマの整理**
   - `backend/api/schemas/` に `PostBase`, `Post`, `PostResponse`, `CategoryResponse` などを追加
   - フロントが想定するフィールドを含める
   - `created_at` は UTC かつ ISO 8601 形式で出力する

3. **API 実装**
   - `GET /api/posts` を実装
   - `POST /api/posts` を実装
   - `POST /api/posts/{id}/like` を実装
   - `GET /api/categories` を実装

4. **永続化の整理**
   - 現在は `data.json` で良いが、スキーマを安定させる
   - 可能なら SQLite へ移行して `posts`, `categories`, `users`, `likes`, `post_images` の構造を検討

5. **フロント連携と動作確認**
   - `curl` やフロント画面で `GET /api/posts` などを確認
   - CORS 設定を `http://localhost:3000` へ許可
   - エラー形式を共通化

---

## 5. 実装チェックリスト

### バックエンド側
- [ ] POST テーブル設計
- [ ] `GET /api/posts` 実装
- [ ] `POST /api/posts` 実装
- [ ] `POST /api/posts/{id}/like` 実装
- [ ] `GET /api/categories` 実装
- [ ] `backend/api/main.py` で `posts` ルーターを登録
- [ ] CORS 設定を `http://localhost:3000` へ許可
- [ ] `created_at` を ISO 8601 / UTC で返す
- [ ] エラーレスポンスを共通化
- [ ] `data.json` 保存形式の安定化

### フロントエンド側（参照用）
- [ ] POST 型定義を確定
- [ ] API URL を環境変数で管理（後で）
- [ ] 404 / 500 などのエラーハンドリング
- [ ] ローディング状態の表示

---

## 6. ルールと注意点

- 日時形式は ISO 8601 で統一し、可能なら UTC に変換して返す
- CORS は `http://localhost:3000` を許可する
- 現在は認証なしのダミーユーザー想定
- エラーはフロントが扱いやすい JSON 形式で返す
  ```json
  {
    "error": "エラーメッセージ",
    "status": 400
  }
  ```
- まずは最小構成で動かし、あとからカテゴリや画像投稿を追加する

---

## 7. 作業フロー（推奨）

```text
仕様確認
  ↓
データモデル整理
  ↓
API実装
  ↓
保存/永続化整備
  ↓
フロント連携テスト
  ↓
修正・改善
```

---

## 8. 参考

- `FRONTEND_BACKEND_INTEGRATION.md`
- `frontend/README.md`
- ルート `README.md`

> この README はバックエンド担当がフロント連携仕様を具体的に実装するためのガイドです。
> 実装途中で内容を更新してください。
