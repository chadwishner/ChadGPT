import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { basename } from "path";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const DISCORD_API = "https://discord.com/api/v10";

async function discordFetch(path, options = {}) {
  const res = await fetch(`${DISCORD_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Ensures a thread exists for the conversation, creating one if needed.
 * Returns the thread ID.
 */
async function ensureThread(conversationId, existingThreadId) {
  if (existingThreadId) return existingThreadId;

  const thread = await discordFetch(`/channels/${DISCORD_CHANNEL_ID}/threads`, {
    method: "POST",
    body: JSON.stringify({
      name: `Chat: ${conversationId.slice(0, 8)}`,
      type: 11, // PUBLIC_THREAD
      auto_archive_duration: 1440, // 24 hours
    }),
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { discordThreadId: thread.id },
  });

  return thread.id;
}

/**
 * Creates a thread (if needed) and posts the user's message to it.
 */
export async function postToDiscord(conversationId, content, existingThreadId) {
  const threadId = await ensureThread(conversationId, existingThreadId);

  await discordFetch(`/channels/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: `**User:** ${content}`,
    }),
  });
}

/**
 * Sends a file attachment to the Discord thread.
 */
export async function postFileToDiscord(conversationId, filepath, filename, existingThreadId) {
  const threadId = await ensureThread(conversationId, existingThreadId);

  const fileBuffer = await readFile(filepath);
  const form = new FormData();
  form.append("content", `**User** sent a file: ${filename}`);
  form.append("files[0]", new Blob([fileBuffer]), basename(filepath));

  const res = await fetch(`${DISCORD_API}/channels/${threadId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API error ${res.status}: ${text}`);
  }
}
