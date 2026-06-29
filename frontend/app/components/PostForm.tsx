"use client";

import { useEffect, useState } from "react";

interface PostFormProps {
  onSubmit: (content: string, category?: string) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
}

export default function PostForm({ onSubmit, categories, onAddCategory }: PostFormProps) {
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? "");
  const [customCategory, setCustomCategory] = useState("");

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

    if (content && category) {
      onSubmit(content, category);
      setInput("");
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
    <div className="border-b border-gray-200 p-3 sm:p-4 bg-white">
      <div className="flex gap-2 sm:gap-4">
        {/* アバター */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
          ME
        </div>

        {/* 入力エリア */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
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
              className="flex-1 min-w-[140px] rounded-full border border-gray-300 px-3 py-1 text-sm outline-none focus:border-blue-500"
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
            className="w-full text-base sm:text-lg resize-none outline-none placeholder-gray-500 bg-transparent"
            rows={3}
          />

          <div className="flex justify-end mt-3 sm:mt-4">
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              投稿する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
