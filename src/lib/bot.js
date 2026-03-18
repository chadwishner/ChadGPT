/**
 * Discord bot — runs inside the Next.js server process.
 * Imported as a side-effect by API routes to ensure it starts.
 * Uses globalThis guard to only initialize once.
 */

import { Client, GatewayIntentBits, Events } from "discord.js";
import { addMessage, findConversationByThread } from "@/lib/store";

const CHAD_DISCORD_USER_ID = process.env.CHAD_DISCORD_USER_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

if (!globalThis.__chadgptBot && DISCORD_BOT_TOKEN && DISCORD_CHANNEL_ID && CHAD_DISCORD_USER_ID) {
  globalThis.__chadgptBot = true;

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`🤖 ChadGPT Bot is online as ${c.user.tag}`);
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.author.id !== CHAD_DISCORD_USER_ID) return;
    if (!message.channel.isThread()) return;
    if (message.channel.parentId !== DISCORD_CHANNEL_ID) return;

    const conversationId = findConversationByThread(message.channel.id);
    if (!conversationId) return;

    addMessage(conversationId, { content: message.content, role: "chad" });
    console.log(`💬 Saved Chad's reply to conversation ${conversationId.slice(0, 8)}`);
  });

  client.login(DISCORD_BOT_TOKEN).catch((err) => {
    console.error("Failed to start Discord bot:", err.message);
    globalThis.__chadgptBot = false;
  });
}
