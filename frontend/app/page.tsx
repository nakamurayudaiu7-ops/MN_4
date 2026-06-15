"use client";

import { useState } from "react";
import PostForm from "./components/PostForm";
import Timeline from "./components/Timeline";
import { Post } from "./types/post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "山田太郎",
      profileImage: "Y",
      content: "課題終わらせた！",
      category: "宿題",
      images: [],
      likes_count: 5,
      created_at: "2時間前",
    },
    {
      id: 2,
      author: "鈴木花子",
      profileImage: "S",
      content: "筋トレ30分完了💪",
      category: "筋トレ",
      images: [],
      likes_count: 12,
      created_at: "5時間前",
    },
    {
      id: 3,
      author: "田中次郎",
      profileImage: "T",
      content: "お弁当作った🍙",
      category: "家事",
      images: [],
      likes_count: 8,
      created_at: "1日前",
    },
  ]);

  const handleAddPost = (content: string) => {
    const newPost: Post = {
      id: posts.length + 1,
      author: "あなた",
      profileImage: "A",
      content,
      likes_count: 0,
      created_at: "今",
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (id: number) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, likes_count: post.likes_count + 1 } : post
      )
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-200 p-4 bg-white bg-opacity-80 backdrop-blur sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">やったー！</h1>
      </header>

      {/* メイン */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full border-l border-r border-gray-200">
        <PostForm onSubmit={handleAddPost} />
        <Timeline posts={posts} onLike={handleLike} />
      </main>
    </div>
  );
}
