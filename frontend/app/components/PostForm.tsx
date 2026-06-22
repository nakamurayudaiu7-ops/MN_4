"use client";

import { useState } from "react";

interface PostFormProps {
  onSubmit: (content: string) => void;
}

export default function PostForm({ onSubmit }: PostFormProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  const isDisabled = input.trim() === "";

  return (
    <div className="border-b border-gray-200 p-3 sm:p-4 bg-white">
      <div className="flex gap-2 sm:gap-4">
        {/* アバター */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
          ME
        </div>

        {/* 入力エリア */}
        <div className="flex-1">
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
