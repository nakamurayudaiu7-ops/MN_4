"use client";

interface AuthPanelProps {
  mode: "login" | "register";
  username: string;
  password: string;
  displayName: string;
  error: string | null;
  onModeChange: (mode: "login" | "register") => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onSubmit: () => void;
}

export default function AuthPanel({
  mode,
  username,
  password,
  displayName,
  error,
  onModeChange,
  onUsernameChange,
  onPasswordChange,
  onDisplayNameChange,
  onSubmit,
}: AuthPanelProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
            mode === "login" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => onModeChange("register")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
            mode === "register" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          アカウント作成
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-gray-700">
          <span className="mb-1 block font-semibold">ユーザーネーム</span>
          <input
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="example"
          />
        </label>

        <label className="block text-sm text-gray-700">
          <span className="mb-1 block font-semibold">パスワード</span>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="4文字以上"
          />
        </label>

        {mode === "register" && (
          <label className="block text-sm text-gray-700">
            <span className="mb-1 block font-semibold">表示名</span>
            <input
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="山田 太郎"
            />
          </label>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={onSubmit}
        className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
      >
        {mode === "login" ? "ログイン" : "登録する"}
      </button>
    </div>
  );
}
