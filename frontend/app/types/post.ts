export interface Post {
  id: number;
  author: string;
  profileImage: string;            // プロフィール画像
  content: string;
  category?: string;               // カテゴリ（筋トレ、宿題、家事など）
  images?: string[];               // 画像URL配列
  likes_count: number;
  created_at: string;              // ISO 8601形式（例：2024-06-22T12:00:00Z）
}
