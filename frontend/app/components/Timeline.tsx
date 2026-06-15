"use client";

import { useState } from "react";
import { Post } from "../types/post";
import PostCard from "./PostCard";

interface TimelineProps {
  posts: Post[];
  onLike: (id: number) => void;
}

// TODO: バックエンド完成後、以下に修正予定
// const CATEGORIES = ["筋トレ", "宿題", "家事"] as const;
// 
// 改善案：
// 1. Timeline コンポーネントの props に categories を追加
// 2. バックエンド API (GET /api/categories) から動的に取得
// 3. ハードコードを削除し、以下のように修正する：
//
// interface TimelineProps {
//   posts: Post[];
//   categories: string[];  // ← バックエンドから受け取る
//   onLike: (id: number) => void;
// }
//
// export default function Timeline({ posts, categories, onLike }: TimelineProps) {
//   // CATEGORIES の代わりに categories を使う
//   {categories.map((category) => (...))}
//
// 対応するバックエンド API：
// - GET /api/categories → { "categories": ["筋トレ", "宿題", "家事"] }

const CATEGORIES = ["筋トレ", "宿題", "家事"] as const;

export default function Timeline({ posts, onLike }: TimelineProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // フィルタ処理
  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;

  return (
    <div className="border-l border-r border-gray-200 divide-y divide-gray-200 min-h-screen">
      {/* フィルタボタン */}
      <div className="border-b border-gray-200 p-4 bg-white sticky top-16 z-10">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              selectedCategory === null
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            全て
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 投稿リスト */}
      {filteredPosts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p className="text-lg">投稿がまだありません</p>
          <p className="text-sm">今日やったことを共有しましょう！</p>
        </div>
      ) : (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} onLike={onLike} />)
      )}
    </div>
  );
}
