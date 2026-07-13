"use client";

import { useEffect, useState } from "react";

interface PostFormProps {
  onSubmit: (content: string, category?: string, images?: string[]) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
}

export default function PostForm({ onSubmit, categories, onAddCategory }: PostFormProps) {
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? "");
  const [customCategory, setCustomCategory] = useState("");
  const [imageInput, setImageInput] = useState("");

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategory("");
      return;
    }

    if (!selectedCategory || !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const handleSubmit = () => {
    const content = input.trim();
    const category = selectedCategory.trim();
    const images = imageInput
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (content && category) {
      onSubmit(content, category, images);
      setInput("");
      setImageInput("");
      setCustomCategory("");
    }
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

          <textarea
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="画像URLを1行ずつ入れる（任意）"
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none placeholder-gray-400"
            rows={2}
          />

          <div className="mt-3 flex justify-end sm:mt-4">
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-2 sm:text-base"
            >
              投稿する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
