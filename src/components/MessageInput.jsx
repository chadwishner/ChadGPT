"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 208)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if ((!input.trim() && !pendingFile) || disabled) return;
    onSend(input.trim(), pendingFile || null);
    setInput("");
    clearFile();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const clearFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setPendingFile(null);
    setFilePreview(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
    // Reset so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleSpeech = useCallback(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  return (
    <div
      className="bg-[var(--bg-tertiary)] overflow-clip p-2.5 grid grid-cols-[auto_1fr_auto] shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
      style={{ borderRadius: "28px" }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Leading — plus button */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
          aria-label="Attach file"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Primary — textarea + file preview */}
      <div className="-my-2.5 flex min-h-[56px] flex-col justify-center overflow-x-hidden px-1.5">
        {pendingFile && (
          <div className="flex items-center gap-2 mt-2 mb-1 px-1">
            {filePreview ? (
              <img src={filePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <div className="flex items-center gap-1.5 bg-[var(--surface-hover)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span className="max-w-[200px] truncate">{pendingFile.name}</span>
              </div>
            )}
            <button
              onClick={clearFile}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto max-h-52 flex items-center">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none outline-none text-base leading-6"
          />
        </div>
      </div>

      {/* Trailing — send or voice button */}
      <div className="flex items-center gap-1.5">
        {input.trim() || pendingFile ? (
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
              <path d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v12.813a1.143 1.143 0 0 1-2.286 0V12.473l-3.192 3.192a1.143 1.143 0 0 1-1.616-1.616z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={toggleSpeech}
            className={`flex items-center justify-center h-9 rounded-full min-w-8 p-2 hover:opacity-80 transition-colors ${
              isListening ? "text-red-500" : "text-[var(--text-secondary)]"
            }`}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
