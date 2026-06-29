"use client";

import { useEffect, useState } from "react";
import PostForm from "./components/PostForm";
import Timeline from "./components/Timeline";
import { Post } from "./types/post";

const DEFAULT_CATEGORIES = ["筋トレ", "勉強", "家事"];

function loadCategories() {
  if (typeof window === "undefined") {
    return DEFAULT_CATEGORIES;
  }

  const stored = window.localStorage.getItem("yatter-categories");
  if (!stored) {
    return DEFAULT_CATEGORIES;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export default function Home() {
  // ダミーデータ用：現在時刻を基準に過去の時刻を計算
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "山田太郎",
      profileImage: "Y",
      content: "課題終わらせた！",
      category: "勉強",
      images: ["https://cdn.pixabay.com/photo/2016/11/22/19/27/animal-1850192_1280.jpg"],
      likes_count: 5,
      created_at: twoHoursAgo.toISOString(),
    },
    {
      id: 2,
      author: "鈴木花子",
      profileImage: "S",
      content: "筋トレ30分完了💪",
      category: "筋トレ",
      images: [
        "https://cdn.pixabay.com/photo/2020/03/20/20/00/cherry-blossoms-4951853_1280.jpg",
        "https://cdn.pixabay.com/photo/2015/05/04/10/36/verba-752171_1280.jpg"
      ],
      likes_count: 12,
      created_at: fiveHoursAgo.toISOString(),
    },
    {
      id: 3,
      author: "田中次郎",
      profileImage: "T",
      content: "お弁当作った🍙",
      category: "家事",
      images: [],
      likes_count: 8,
      created_at: oneDayAgo.toISOString(),
    },
  ]);
  const [categories, setCategories] = useState<string[]>(loadCategories);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("yatter-categories", JSON.stringify(categories));
    }
  }, [categories]);

  const handleAddPost = (content: string, category?: string) => {
    const newPost: Post = {
      id: posts.length + 1,
      author: "あなた",
      profileImage: "A",
      content,
      category,
      images: [],
      likes_count: 0,
      created_at: new Date().toISOString(),
    };
    setPosts([newPost, ...posts]);
  };

  const handleAddCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) {
      return;
    }

    setCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
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
      <header className="border-b border-gray-200 p-3 sm:p-4 bg-white bg-opacity-80 backdrop-blur sticky top-0 z-10">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Yatter</h1>
      </header>

      {/* メイン */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full border-l border-r border-gray-200 hidden sm:flex">
        <PostForm onSubmit={handleAddPost} categories={categories} onAddCategory={handleAddCategory} />
        <Timeline posts={posts} categories={categories} onLike={handleLike} />
      </main>

      {/* モバイル用メイン */}
      <main className="flex-1 flex flex-col w-full sm:hidden">
        <PostForm onSubmit={handleAddPost} categories={categories} onAddCategory={handleAddCategory} />
        <Timeline posts={posts} categories={categories} onLike={handleLike} />
      </main>
    </div>
  );
}
