"use client";

import { useState, useRef, useEffect } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Listen for suggestion clicks from welcome screen
  useEffect(() => {
    const handler = (e) => {
      if (typeof e.detail === "string") {
        onSend(e.detail);
      }
    };
    window.addEventListener("chadgpt-suggestion", handler);
    return () => window.removeEventListener("chadgpt-suggestion", handler);
  }, [onSend]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex items-end bg-[var(--bg-tertiary)] rounded-2xl border border-[#424242] focus-within:border-[#555]">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message ChadGPT..."
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] px-4 py-3 resize-none outline-none text-[15px] max-h-[200px]"
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || disabled}
        className="p-2 m-1.5 rounded-lg bg-white text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        aria-label="Send message"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </div>
  );
}
