import { Post } from "../types/post";

interface PostCardProps {
  post: Post;
  onLike: (id: number) => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition cursor-pointer">
      <div className="flex gap-3">
        {/* プロフィール画像 */}
        <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {post.profileImage}
        </div>

        {/* 投稿内容 */}
        <div className="flex-1 min-w-0">
          {/* ユーザー情報 */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 hover:underline">{post.author}</span>
            <span className="text-gray-500">@user</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">{post.created_at}</span>
          </div>

          {/* テキスト */}
          <p className="text-gray-900 text-base mt-2 break-words">{post.content}</p>

          {/* カテゴリ */}
          {post.category && (
            <div className="mt-2">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                #{post.category}
              </span>
            </div>
          )}

          {/* アクション */}
          <div className="flex gap-8 mt-3 text-gray-500 max-w-xs">
            <button className="flex items-center gap-2 hover:text-blue-500 transition group">
              <span className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-blue-100">
                💬
              </span>
            </button>

            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-2 hover:text-red-500 transition group"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-red-100">
                ❤️
              </span>
              <span className="text-sm">{post.likes_count}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
