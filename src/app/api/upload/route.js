import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToDiscord, postFileToDiscord } from "@/lib/discord-api";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req) {
  try {
  const formData = await req.formData();
  const conversationId = formData.get("conversationId");
  const file = formData.get("file");

  if (!conversationId || !file) {
    return NextResponse.json(
      { error: "conversationId and file are required" },
      { status: 400 }
    );
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed" },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File must be under 10MB" },
      { status: 400 }
    );
  }

  // Generate safe filename
  const ext = file.name.split(".").pop().toLowerCase();
  const safeExts = ["jpg", "jpeg", "png", "gif", "webp", "pdf"];
  const finalExt = safeExts.includes(ext) ? ext : "bin";
  const filename = `${randomUUID()}.${finalExt}`;
  const filepath = join(process.cwd(), "public", "uploads", filename);

  // Write file to disk
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  const attachmentUrl = `/uploads/${filename}`;
  const attachmentType = file.type === "application/pdf" ? "pdf" : "image";

  // Find or create conversation
  let conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { id: conversationId },
    });
  }

  // Use provided text content or fall back to filename
  const content = formData.get("content") || file.name;

  // Create the message
  await prisma.message.create({
    data: {
      content,
      role: "user",
      attachmentUrl,
      attachmentType,
      conversationId,
    },
  });

  // Send file to Discord thread, include text if provided
  try {
    await postFileToDiscord(
      conversationId,
      filepath,
      file.name,
      conversation.discordThreadId
    );
    if (content && content !== file.name) {
      await postToDiscord(conversationId, content, conversation.discordThreadId);
    }
  } catch (err) {
    console.error("Failed to send file to Discord:", err);
  }

  // Return updated messages
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
