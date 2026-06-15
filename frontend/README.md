# フロントエンド開発ガイド

## プロジェクト概要

**「やったー！」** - やったことを共有していいねするシンプルなSNS風Webアプリ

- **フレームワーク**: Next.js 16.2.7
- **スタイル**: Tailwind CSS
- **状態管理**: React hooks (useState)
- **UI**: Twitter/Bluesky風

---

## 環境構築

### 初回セットアップ

```bash
cd frontend
npm install
npm run dev
```

開発サーバーが起動します → [http://localhost:3000](http://localhost:3000)

---

## プロジェクト構造

```
frontend/app/
├── components/           ← React コンポーネント
│   ├── PostForm.tsx      ← 投稿フォーム (担当者A)
│   ├── PostCard.tsx      ← 1つの投稿カード (担当者B)
│   └── Timeline.tsx      ← タイムライン表示 (担当者B)
├── types/
│   └── post.ts           ← 共通型定義
├── page.tsx              ← メインページ (ロジック管理)
├── layout.tsx
└── globals.css
```

---

## コンポーネント分割方針

### 3つの主要コンポーネント

#### 1️⃣ **PostForm.tsx** (担当者A)
- **責務**: 投稿フォーム UI
- **props**: 
  - `onSubmit(content: string)` - 投稿送信時のコールバック
- **編集項目**:
  - 入力欄のデザイン
  - 送信ボタンの動作
  - バリデーション
  - Ctrl+Enterでの送信など UX改善

#### 2️⃣ **PostCard.tsx** (担当者B)
- **責務**: 1つの投稿カードの表示とアクション
- **props**:
  - `post: Post` - 投稿データ
  - `onLike(id: number)` - いいね押下時のコールバック
- **編集項目**:
  - 投稿カードのデザイン
  - ホバーエフェクト
  - リアクションボタンの追加（コメント、共有など）

#### 3️⃣ **Timeline.tsx** (担当者B)
- **責務**: 投稿一覧表示
- **props**:
  - `posts: Post[]` - 投稿配列
  - `onLike(id: number)` - いいね処理のコールバック
- **編集項目**:
  - 投稿一覧のレイアウト
  - スクロール時の無限ロード対応
  - 空状態の表示

---

## 今後開発する機能

### ✅ 必須機能（既実装）
- [x] タイムライン表示
- [x] 投稿機能
- [x] いいね機能

### 🔄 次フェーズ（バックエンド連携）
- [ ] **API統合**
  - `GET /api/posts` - タイムライン取得
  - `POST /api/posts` - 新規投稿
  - `POST /api/posts/{id}/like` - いいね
- [ ] バックエンド API レスポンスへの対応
- [ ] エラーハンドリング
- [ ] ローディング状態の表示

### 🎨 UI改善
- [ ] ダークモード対応
- [ ] レスポンシブ修正（モバイル対応）
- [ ] アニメーション
  - いいねのハート アニメーション
  - 投稿追加時のスライドイン
- [ ] 画像プレビュー

### 💡 拡張機能（できたら）
- [ ] **ユーザー認証**
  - ユーザー登録/ログイン
  - 削除キー管理
- [ ] **カテゴリ分け**
  - 「筋トレ」「宿題」「家事」などタグ機能
  - カテゴリ別フィルタ
- [ ] **グループ機能**
  - グループ作成・参加
  - グループ内タイムライン
- [ ] **コメント機能**
- [ ] **タイマー連携**
- [ ] **写真投稿**
- [ ] **いいね以外の評価**（リアクション選択肢）

---

## Git運用方針

### ブランチ戦略

```
main
├── feature/post-form          ← 担当者A が作成・管理
│   └── posts, form UI改善など
│
└── feature/timeline           ← 担当者B が作成・管理
    └── posts表示, いいね機能など
```

### コミット時の注意

- **ファイルの編成**: 各人が担当のファイルのみ編集
  - A: `components/PostForm.tsx`
  - B: `components/PostCard.tsx`, `components/Timeline.tsx`
- **共有ファイルの編集時**は事前に連絡
  - `app/page.tsx`
  - `types/post.ts`
  - `package.json`

---

## データ型定義

### `Post` インターフェース

```typescript
export interface Post {
  id: number;                  // 投稿ID
  author: string;              // ユーザー名
  avatar: string;              // アバター（イニシャル等）
  content: string;             // 投稿内容
  likes_count: number;         // いいね数
  created_at: string;          // 作成日時
}
```

---

## 開発フロー

### 1. ローカル開発
```bash
npm run dev
# ブラウザで動作確認
```

### 2. ブランチ切り替え & 編集
```bash
git checkout -b feature/[機能名]
# 担当のコンポーネントを編集
```

### 3. コミット & プッシュ
```bash
git add .
git commit -m "feat: [説明]"
git push origin feature/[機能名]
```

### 4. プルリクエスト & マージ
- GitHubでプルリクエスト作成
- 他の担当者がレビュー
- `main` にマージ

---

## トラブルシューティング

### エラー: `Cannot find module`
```bash
npm install
npm run dev
```

### 画面が更新されない
- ブラウザをリロード (F5)
- ターミナルで `npm run dev` を再実行

### Tailwind CSS が反映されない
- `globals.css` の import を確認
- `tailwind.config.ts` を確認

---

## 次のステップ

1. **開発環境の確認**: `npm run dev` で画面が表示されるか確認
2. **コンポーネント分割を理解**: 各コンポーネントの責務を確認
3. **ブランチ作成**: 担当ファイルごとにブランチを切る
4. **実装開始**: 次フェーズの機能を追加開発
