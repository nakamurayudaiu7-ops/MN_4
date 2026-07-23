メモ
#画像投稿機能
画像選択
↓
Base64でバックエンドへ送る
↓
関数save_image()でuploadsフォルダへ保存
↓
"/uploads/xxxxx.jpg"をDBへ保存
↓
フロントで表示



# 発表スライド構成（20分）

## 1. タイトル / 導入（1分）
- アプリ名と発表者
- 「何を作ったのか」を一言
- 発表のゴール

## 2. 解決したい課題と狙い（2分）
- 課題: 日々の行動を手軽に投稿・共有したい
- ターゲット: 習慣記録、学習ログ、家事ログを残したい人
- 目標: シンプルに投稿・一覧・いいねができるUI

---

## 3. フロントエンド構成と技術（2分）
- `frontend/app/page.tsx`
  - `useState` で投稿一覧・カテゴリを管理
  - `useEffect` でバックエンドから `GET /api/posts` を取得
- 主要コンポーネント
  - `frontend/app/components/PostForm.tsx`
  - `frontend/app/components/Timeline.tsx`
  - `frontend/app/components/PostCard.tsx`
- 技術スタック
  - Next.js（App Router）
  - React Hooks
  - Tailwind系のユーティリティクラス

## 4. フロントエンド機能（2分）
- 投稿フォーム
  - テキスト入力
  - カテゴリ選択
  - カスタムカテゴリ追加
  - `Ctrl/Cmd + Enter` で送信
- 一覧表示
  - 投稿カード表示
  - `author` / `content` / `category` / `likes_count` / `created_at`
  - 画像配列 `images` 表示対応
- フィルタ機能
  - カテゴリ別フィルタ
  - 「全て」ボタン
- ローカル保存
  - `localStorage` にカテゴリを保存
  - 再読み込み後もカテゴリが残る

## 5. フロントエンドデモ（3分）
- 投稿を入力して送信
- カテゴリ追加と絞り込み
- いいねボタンで `likes_count` が増える
- `PostCard` のアニメーション表示

---

## 6. バックエンド構成と技術（2分）
- `backend/api/main.py`
  - FastAPI アプリ
  - CORS 設定
  - `lifespan` で `data.json` に永続化
- `backend/api/db.py`
  - `get_system` で `app.state.system` を提供
- スキーマ
  - `backend/api/schemas/post.py`
  - `backend/api/schemas/system.py`

## 7. 実装済み API（2分）
- `GET /api/posts`
  - 投稿一覧取得
  - `from_id`, `to_id`, `from_time`, `category`, `ids_only` に対応
- `POST /api/posts`
  - 新規投稿作成
- `GET /api/posts/{message_id}`
  - 個別投稿取得
- `POST /api/posts/{message_id}/like`
  - いいね数インクリメント
- `data.json` 保存
  - サーバー起動時に読み込み、終了時に書き込み

## 8. バックエンドデモ（3分）
- `GET /api/posts` を確認
- フロントから `POST /api/posts` で投稿
- `like` API が動く様子を確認

---

## 9. 現状の完成度と注意点（2分）
- できていること
  - 投稿作成、一覧表示、カテゴリ絞り込み、いいね
  - フロントとバックエンドの連携
- 注意点
  - `frontend` の `API_BASE` が固定ホスト `http://192.168.50.15:8000`
  - `backend` に `message.py` と `posts.py` の似たルートが共存している可能性
  - フロント型は `created_at: string`、バックエンドは `datetime`

## 10. 今後の改善案
- エラーハンドリング強化
- 投稿詳細ページや編集機能
- 認証 / ユーザー管理
- `API_BASE` を環境変数化
- ルーティングの整理

---

## スライド枚数イメージ
- 1枚: タイトル
- 1枚: 課題と狙い
- 1枚: 全体構成（フロント/バック）
- 2枚: フロント実装とデモ
- 2枚: バックエンド実装とデモ
- 1枚: 現状の完成度と改善案

> 20分なら、説明13分、デモ5〜6分、まとめ2分がバランス良いです。
