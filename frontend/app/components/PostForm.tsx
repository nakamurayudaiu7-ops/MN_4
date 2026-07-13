"use client";

import { useEffect, useState } from "react";

interface PostFormProps {
  onSubmit: (content: string, category?: string, images?: string[]) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
}

//const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";
//const API_BASE = "http://127.0.0.1:8001";
const API_BASE = "http://192.168.50.15:8000";

export default function PostForm({ onSubmit, categories, onAddCategory }: PostFormProps) {
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? "");
  const [customCategory, setCustomCategory] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategory("");
      return;
    }

    if (!selectedCategory || !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const handleSubmit = async () => {
    const content = input.trim();
    const category = selectedCategory.trim();

    if (!content || !category) {
      return;
    }

    let images: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      setUploading(true);
      const formData = new FormData();
      Array.from(imageFiles).forEach((file) => formData.append("files", file));
      const token = typeof window !== "undefined" ? window.localStorage.getItem("yatter-token") : null;
      const response = await fetch(`${API_BASE}/api/posts/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        images = data.images ?? [];
      }
      setUploading(false);
    }

    onSubmit(content, category, images);
    setInput("");
    setImageFiles(null);
    setCustomCategory("");
  };

  const handleAddCategory = () => {
    const category = customCategory.trim();

    if (!category) {
      return;
    }

    onAddCategory(category);
    setSelectedCategory(category);
    setCustomCategory("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  const isDisabled = input.trim() === "" || selectedCategory.trim() === "";

  return (
    <div className="border-b border-gray-200 bg-white p-3 sm:p-4">
      <div className="flex gap-2 sm:gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-400 text-sm font-bold text-white sm:h-12 sm:w-12 sm:text-lg">
          ME
        </div>

        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">この投稿のカテゴリ</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              placeholder="新しいカテゴリを追加"
              className="min-w-[140px] flex-1 rounded-full border border-gray-300 px-3 py-1 text-sm outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="rounded-full border border-blue-500 px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              追加
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="今日やったことは？"
            className="w-full resize-none bg-transparent text-base outline-none placeholder-gray-500 sm:text-lg"
            rows={3}
          />

          <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(e.target.files)}
              className="text-sm"
            />
            {uploading ? <span className="text-blue-500">アップロード中...</span> : null}
          </label>

          <div className="mt-3 flex justify-end sm:mt-4">
            <button
              onClick={handleSubmit}
              disabled={isDisabled || uploading}
              className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-2 sm:text-base"
            >
              {uploading ? "送信中..." : "投稿する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
