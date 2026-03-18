"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import Header from "@/components/Header";

const WELCOME_MESSAGES = [
  "Ask Chad anything",
  "What would Chad do?",
  "Chad is typing... just kidding, he's napping",
  "You've reached Chad. Leave a message after the beep.",
  "Chad sees all. Chad knows all. Chad responds... eventually.",
  "Powered by 100% organic Chad",
  "Now with 50% more Chad",
  "Chad is ready. Mentally? Debatable.",
  "Warning: responses may contain sarcasm",
  "Like AI, but worse",
  "The human behind the curtain",
  "Ask me anything. I'll Google it.",
  "Not a robot. Just built different.",
  "Your message is important to Chad. Please hold.",
  "Chad's brain: loading...",
  "Smarter than Siri. Lower bar than you'd think.",
  "May take 1-3 business days to respond",
  "No neural network. Just one neuron.",
  "Certified 0% artificial intelligence",
  "Think ChatGPT, but with commitment issues",
];

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
  const [awaitingReply, setAwaitingReply] = useState(false);
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
          // Clear awaiting reply once Chad responds
          if (data.messages.length > 0 && data.messages[data.messages.length - 1].role === "chad") {
            setAwaitingReply(false);
          }
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

  const sendMessage = async (content, file) => {
    if ((!content && !file) || !conversationId) return;

    // Start transition if on welcome screen
    if (messages.length === 0) {
      setTransitioning(true);
    }

    // Optimistic update
    const isImage = file?.type?.startsWith("image/");
    const optimistic = {
      id: uuidv4(),
      content: content || file?.name || "",
      role: "user",
      attachmentUrl: file && isImage ? URL.createObjectURL(file) : null,
      attachmentType: file ? (isImage ? "image" : "pdf") : null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setIsLoading(true);
    setAwaitingReply(true);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("file", file);
        if (content) formData.append("content", content);
        res = await fetch("/api/upload", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content }),
        });
      }

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
    setAwaitingReply(false);
    setTransitioning(false);
  };

  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setWelcomeMessage(
      WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
    );
  }, []);

  const showWelcome = messages.length === 0 && !transitioning;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto h-screen bg-[var(--bg-primary)]">
      <Header onNewChat={handleNewChat} />

      <main className="min-h-0 flex-1" id="main">
        <div className="flex flex-col min-h-full">
          <div className="flex flex-1 flex-col">
            {/* Welcome heading — fades out on send */}
            <div
              className="relative flex flex-col justify-end shrink sm:min-h-[calc(42svh-3.5rem)] max-sm:grow max-sm:justify-center"
              style={{
                transition: "opacity 0.4s ease, max-height 0.5s ease, margin 0.5s ease",
                opacity: showWelcome ? 1 : 0,
                maxHeight: showWelcome ? "50vh" : "0px",
                overflow: "hidden",
              }}
            >
              <div className="flex justify-center">
                <div className="mb-10 text-center">
                  <h1 className="text-2xl leading-9 font-semibold">
                    {welcomeMessage}
                  </h1>
                </div>
              </div>
            </div>

            {/* Messages — fades in */}
            {!showWelcome && (
              <div
                className="relative flex-col grow flex animate-fade-in"
              >
                <div className="flex flex-col text-sm" style={{ paddingBottom: "110px" }}>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {awaitingReply && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {/* Composer — always at bottom */}
            <div className="sticky bottom-0 z-10 w-full bg-[var(--bg-primary)] flex flex-col" style={{ transition: "all 0.4s ease" }}>
              <div className="mx-auto max-w-[48rem] w-full flex-1 mb-4 px-4 sm:px-6 lg:px-16">
                <MessageInput onSend={sendMessage} disabled={isLoading} />
              </div>
              <div className="-mt-4 text-[var(--text-secondary)] w-full text-center text-xs">
                <div className="flex min-h-8 w-full items-center justify-center p-2">
                  {showWelcome ? (
                    <span className="text-sm leading-none">
                      By messaging ChadGPT, a real human, you agree that Chad
                      may ghost you. Response times may vary wildly.
                    </span>
                  ) : (
                    <>ChadGPT can make mistakes. He&apos;s only human.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TypingIndicator() {
  return (
    <article className="w-full pb-10" dir="auto">
      <div className="max-w-[40rem] lg:max-w-[48rem] mx-auto">
        <div className="flex items-center gap-1 py-3">
          <span className="typing-dot w-2 h-2 bg-[var(--text-secondary)] rounded-full inline-block" />
          <span className="typing-dot w-2 h-2 bg-[var(--text-secondary)] rounded-full inline-block" />
          <span className="typing-dot w-2 h-2 bg-[var(--text-secondary)] rounded-full inline-block" />
        </div>
      </div>
    </article>
  );
}
