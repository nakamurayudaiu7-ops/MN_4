"use client";

import { useState } from "react";
import { Post } from "../types/post";
import PostCard from "./PostCard";

interface TimelineProps {
  posts: Post[];
  categories: string[];
  onLike: (id: number) => void;
}

export default function Timeline({ posts, categories, onLike }: TimelineProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // フィルタ処理
  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;

  return (
    <div className="border-l border-r border-gray-200 divide-y divide-gray-200 min-h-screen">
      {/* フィルタボタン */}
      <div className="border-b border-gray-200 p-2 sm:p-4 bg-white sticky top-16 z-10">
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full font-semibold transition ${
              selectedCategory === null
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            全て
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full font-semibold transition ${
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
