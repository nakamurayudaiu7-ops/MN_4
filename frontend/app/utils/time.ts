/**
 * ISO 8601 形式のタイムスタンプを相対時間文字列に変換
 * @param dateString ISO 8601 形式の日時文字列（例：2024-06-15T10:30:00Z）
 * @returns 相対時間文字列（例：2時間前）
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // 1分未満
  if (diffSec < 60) {
    return "今";
  }

  // 1時間未満
  if (diffMin < 60) {
    return `${diffMin}分前`;
  }

  // 24時間未満
  if (diffHour < 24) {
    return `${diffHour}時間前`;
  }

  // 7日未満
  if (diffDay < 7) {
    return `${diffDay}日前`;
  }

  // 30日未満
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks}週間前`;
  }

  // 365日未満
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months}ヶ月前`;
  }

  // 1年以上
  const years = Math.floor(diffDay / 365);
  return `${years}年前`;
}
