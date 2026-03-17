import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToDiscord } from "@/lib/discord-api";

// GET /api/messages?conversationId=xxx
export async function GET(req) {
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ messages: [] });
  }

  return NextResponse.json({ messages: conversation.messages });
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

  // Find or create conversation
  let conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { id: conversationId },
    });
  }

  // Create the message
  await prisma.message.create({
    data: {
      content: sanitizedContent,
      role: "user",
      conversationId,
    },
  });

  // Send to Discord thread
  try {
    await postToDiscord(conversationId, sanitizedContent, conversation.discordThreadId);
  } catch (err) {
    console.error("Failed to send to Discord:", err);
  }

  // Return updated messages
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}
