import { Post } from "../types/post";
import PostCard from "./PostCard";

interface TimelineProps {
  posts: Post[];
  onLike: (id: number) => void;
}

export default function Timeline({ posts, onLike }: TimelineProps) {
  return (
    <div className="border-l border-r border-gray-200 divide-y divide-gray-200 min-h-screen">
      {posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p className="text-lg">投稿がまだありません</p>
          <p className="text-sm">今日やったことを共有しましょう！</p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} onLike={onLike} />)
      )}
    </div>
  );
}
