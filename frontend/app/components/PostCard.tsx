"use client";

import { useState } from "react";
import { Post } from "../types/post";
import { formatRelativeTime } from "../utils/time";
import { API_BASE } from "@/config";


interface PostCardProps {
  post: Post;
  onLike: (id: number) => void;
  onDelete?: (id: number) => void;
  isOwner?: boolean;
}

export default function PostCard({ post, onLike, onDelete, isOwner }: PostCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLikeClick = () => {
    onLike(post.id);
    
    // アニメーション開始
    setIsAnimating(true);
    
    // 600ms 後にアニメーション終了
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const images = post.images ?? [];

  const getImageSrc = (image: string) => {
    if (image.startsWith("/")) {
      return `${API_BASE}${image}`;
    }
    return image;
  };

  return (
    <div className="border-b border-gray-200 p-3 sm:p-4 hover:bg-gray-50 transition cursor-pointer">
      <style>{`
        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(1.1); }
          75% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(1.5); }
        }
        .animate-heart-beat {
          animation: heartBeat 0.6s ease-in-out;
        }
        .animate-float-up {
          animation: floatUp 0.6s ease-out;
          pointer-events: none;
        }
      `}</style>
      <div className="flex gap-2 sm:gap-3">
        {/* プロフィール画像 */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
          {post.profileImage}
        </div>

        {/* 投稿内容 */}
        <div className="flex-1 min-w-0">
          {/* ユーザー情報 */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <span className="font-bold text-gray-900 hover:underline text-sm sm:text-base">{post.author}</span>
            <span className="text-gray-500 text-xs sm:text-sm">@user</span>
            <span className="text-gray-500 hidden sm:inline">·</span>
            <span className="text-gray-500 text-xs">{formatRelativeTime(post.created_at)}</span>
          </div>

          {/* テキスト */}
          <p className="text-gray-900 text-sm sm:text-base mt-2 break-words">{post.content}</p>

          {/* カテゴリ */}
          {post.category && (
            <div className="mt-2">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                #{post.category}
              </span>
            </div>
          )}

          {/* 画像ギャラリー */}
          {images.length > 0 && (
            <div
              className="mt-3 grid gap-1 sm:gap-2"
              style={{
                gridTemplateColumns: images.length === 1 ? "1fr" : "repeat(2, 1fr)",
              }}
            >
              {images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-gray-200"
                >
                  <img
                    src={getImageSrc(image)}
                    alt={`投稿画像 ${index + 1}`}
                    className="h-full w-full object-cover transition hover:opacity-75"
                  />
                </div>
              ))}
            </div>
          )}

          {/* アクション */}
          {/* リプライボタン */}
          <div className="flex gap-4 sm:gap-8 mt-3 text-gray-500 max-w-xs text-sm sm:text-base">
            { /*<button className="flex items-center gap-2 hover:text-blue-500 transition group">
              <span className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-blue-100">
                💬
              </span>
            </button>
            */}

            {isOwner && onDelete ? (
              <button
                onClick={() => onDelete(post.id)}
                className="rounded-full border border-red-200 px-3 py-1 text-sm text-red-500 hover:bg-red-50"
              >
                削除
              </button>
            ) : null}

            <button
              onClick={handleLikeClick}
              className="flex items-center gap-2 hover:text-red-500 transition group relative"
            >
              <span className={`flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-red-100 text-lg ${
                isAnimating ? "animate-heart-beat" : ""
              }`}>
                ❤️
              </span>
              {isAnimating && (
                <span className="absolute text-lg animate-float-up">❤️</span>
              )}
              <span className="text-sm">{post.likes_count}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
