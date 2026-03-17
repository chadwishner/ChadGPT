"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import Header from "@/components/Header";

function getConversationId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("chadgpt-conversation-id");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("chadgpt-conversation-id", id);
  }
  return id;
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    setConversationId(getConversationId());
  }, []);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!conversationId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/messages?conversationId=${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch {
        // Silently retry on next poll
      }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, 3000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content) => {
    if (!content.trim() || !conversationId) return;

    // Optimistic update
    const optimistic = {
      id: uuidv4(),
      content,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {
      // Keep the optimistic message, it'll sync on next poll
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = uuidv4();
    localStorage.setItem("chadgpt-conversation-id", newId);
    setConversationId(newId);
    setMessages([]);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      <Header onNewChat={handleNewChat} />

      <main className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <WelcomeScreen />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <div className="max-w-3xl mx-auto w-full px-4 pb-4">
        <MessageInput onSend={sendMessage} disabled={isLoading} />
        <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
          ChadGPT is powered by a real human named Chad. Response times may vary.
        </p>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <h1 className="text-4xl font-bold mb-2">ChadGPT</h1>
      <p className="text-[var(--text-secondary)] text-lg mb-8">
        No AI. Just Chad.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
        {[
          "What's your opinion on pineapple pizza?",
          "Can you help me with my homework?",
          "What's the meaning of life?",
          "Tell me a joke",
        ].map((suggestion) => (
          <button
            key={suggestion}
            className="text-left p-3 rounded-xl border border-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors text-sm text-[var(--text-secondary)]"
            onClick={() => {
              const event = new CustomEvent("chadgpt-suggestion", {
                detail: suggestion,
              });
              window.dispatchEvent(event);
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shrink-0">
        C
      </div>
      <div className="flex items-center gap-1 py-3">
        <span className="typing-dot w-2 h-2 bg-[var(--text-secondary)] rounded-full inline-block" />
        <span className="typing-dot w-2 h-2 bg-[var(--text-secondary)] rounded-full inline-block" />
        <span className="typing-dot w-2 h-2 bg-[var(--text-secondary)] rounded-full inline-block" />
      </div>
    </div>
  );
}
