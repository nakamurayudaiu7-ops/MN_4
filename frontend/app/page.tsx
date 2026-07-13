"use client";

import { useEffect, useState } from "react";
import AuthPanel from "./components/AuthPanel";
import PostForm from "./components/PostForm";
import Timeline from "./components/Timeline";
import { Post } from "./types/post";

const DEFAULT_CATEGORIES = ["筋トレ", "勉強", "家事"];
//const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";
const API_BASE = "http://127.0.0.1:8001";
//const API_BASE = "http://192.168.50.15:8000";
type AuthMode = "login" | "register";

type UserSession = {
  id: number;
  username: string;
  display_name: string;
};

type NotificationItem = {
  id: number;
  message: string;
  created_at: string;
};

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
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeUsername, setActiveUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedToken = window.localStorage.getItem("yatter-token");
    const savedUser = window.localStorage.getItem("yatter-user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setSession(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/posts${activeUsername ? `?username=${encodeURIComponent(activeUsername)}` : ""}`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        const fetchedPosts = (data.posts ?? []) as Post[];
        setPosts(fetchedPosts);
      } catch {
        setPosts([]);
      }
    };

    fetchPosts();
  }, [activeUsername]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setNotifications([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setNotifications((data.notifications ?? []) as NotificationItem[]);
      } catch {
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("yatter-categories", JSON.stringify(categories));
    }
  }, [categories]);

  const handleAuth = async () => {
    setAuthError(null);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authMode === "login"
        ? { username, password }
        : { username, password, display_name: displayName };
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "認証に失敗しました");
      }
      const user = data.user as UserSession;
      window.localStorage.setItem("yatter-token", data.token);
      window.localStorage.setItem("yatter-user", JSON.stringify(user));
      setToken(data.token);
      setSession(user);
      setActiveUsername(null);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "認証に失敗しました");
    }
  };

  const handleAddPost = async (content: string, category?: string, images?: string[]) => {
    if (!token) {
      setAuthError("まずログインしてください");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          category,
          images: images ?? [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const createdPost = (await response.json()) as Post;
      setPosts((prev) => [createdPost, ...prev]);
    } catch {
      setAuthError("投稿に失敗しました");
    }
  };

  const handleAddCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) {
      return;
    }

    setCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      setAuthError("ログインしてください");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch {
      setAuthError("削除に失敗しました");
    }
  };

  const handleLike = async (id: number) => {
    if (!token) {
      setAuthError("ログインしてください");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/posts/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, likes_count: post.likes_count + 1 } : post
        )
      );
    } catch {
      setAuthError("いいねに失敗しました");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white bg-opacity-80 p-3 backdrop-blur sm:p-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Yatter</h1>
          {session ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-700">{session.display_name}</span>
              <button
                onClick={() => {
                  window.localStorage.removeItem("yatter-token");
                  window.localStorage.removeItem("yatter-user");
                  setToken(null);
                  setSession(null);
                  setActiveUsername(null);
                }}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600"
              >
                ログアウト
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-3 sm:p-4">
        {!session ? (
          <AuthPanel
            mode={authMode}
            username={username}
            password={password}
            displayName={displayName}
            error={authError}
            onModeChange={setAuthMode}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onDisplayNameChange={setDisplayName}
            onSubmit={handleAuth}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm">
              <button
                onClick={() => setActiveUsername(null)}
                className={`rounded-full px-3 py-1 ${activeUsername === null ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
              >
                全体タイムライン
              </button>
              <button
                onClick={() => setActiveUsername(session.username)}
                className={`rounded-full px-3 py-1 ${activeUsername === session.username ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
              >
                自分の投稿だけ
              </button>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className={`rounded-full px-3 py-1 ${showNotifications ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
              >
                いいね通知
              </button>
            </div>

            {showNotifications ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-3">
                <h2 className="mb-2 text-sm font-semibold text-gray-700">通知</h2>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">まだ通知はありません。</p>
                ) : (
                  <ul className="space-y-2">
                    {notifications.map((item) => (
                      <li key={item.id} className="rounded-lg bg-gray-50 p-2 text-sm text-gray-700">
                        {item.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            <PostForm onSubmit={handleAddPost} categories={categories} onAddCategory={handleAddCategory} />
            <Timeline
              posts={posts}
              categories={categories}
              onLike={handleLike}
              onDelete={handleDelete}
              currentUserName={session?.username ?? null}
            />
          </>
        )}
      </main>
    </div>
  );
}
