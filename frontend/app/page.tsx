"use client";

import { useEffect, useState } from "react";
import PostForm from "./components/PostForm";
import Timeline from "./components/Timeline";
import { Post } from "./types/post";

const DEFAULT_CATEGORIES = ["筋トレ", "勉強", "家事"];
const API_BASE = "http://192.168.50.15:8000";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>(loadCategories);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/posts`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        const fetchedPosts = Object.values(data.posts ?? {}) as Post[];
        setPosts(fetchedPosts);
      } catch {
        setPosts([]);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("yatter-categories", JSON.stringify(categories));
    }
  }, [categories]);

  const handleAddPost = async (content: string, category?: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: "あなた",
          content,
          category,
          images: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const createdPost = (await response.json()) as Post;
      setPosts((prev) => [createdPost, ...prev]);
    } catch {
      // 失敗時は何もしない
    }
  };

  const handleAddCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) {
      return;
    }

    setCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const handleLike = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts/${id}/like`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, likes_count: post.likes_count + 1 } : post
        )
      );
    } catch {
      // 失敗時は何もしない
    }
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
