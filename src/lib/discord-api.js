import { prisma } from "@/lib/prisma";

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
 * Creates a thread (if needed) and posts the user's message to it.
 */
export async function postToDiscord(conversationId, content, existingThreadId) {
  let threadId = existingThreadId;

  // Create a new thread if one doesn't exist
  if (!threadId) {
    const thread = await discordFetch(`/channels/${DISCORD_CHANNEL_ID}/threads`, {
      method: "POST",
      body: JSON.stringify({
        name: `Chat: ${conversationId.slice(0, 8)}`,
        type: 11, // PUBLIC_THREAD
        auto_archive_duration: 1440, // 24 hours
      }),
    });

    threadId = thread.id;

    // Save the thread ID to the conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { discordThreadId: threadId },
    });
  }

  // Send the message to the thread
  await discordFetch(`/channels/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: `**User:** ${content}`,
    }),
  });
}
