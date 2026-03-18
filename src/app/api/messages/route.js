import { NextResponse } from "next/server";
import { getMessages, ensureConversation, addMessage, getThreadId } from "@/lib/store";
import { postToDiscord } from "@/lib/discord-api";
import "@/lib/bot";

// GET /api/messages?conversationId=xxx
export async function GET(req) {
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  return NextResponse.json({ messages: getMessages(conversationId) });
}

// POST /api/messages  { conversationId, content }
export async function POST(req) {
  const body = await req.json();
  const { conversationId, content } = body;

  if (!conversationId || !content) {
    return NextResponse.json(
      { error: "conversationId and content are required" },
      { status: 400 }
    );
  }

  // Sanitize content — limit length
  const sanitizedContent = String(content).slice(0, 2000);

  ensureConversation(conversationId);
  addMessage(conversationId, { content: sanitizedContent, role: "user" });

  // Send to Discord thread
  try {
    await postToDiscord(conversationId, sanitizedContent, getThreadId(conversationId));
  } catch (err) {
    console.error("Failed to send to Discord:", err);
  }

  return NextResponse.json({ messages: getMessages(conversationId) });
}
