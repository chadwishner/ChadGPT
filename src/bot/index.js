import { Client, GatewayIntentBits, Events } from "discord.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHAD_DISCORD_USER_ID = process.env.CHAD_DISCORD_USER_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID || !CHAD_DISCORD_USER_ID) {
  console.error("Missing required environment variables. Check .env file.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`🤖 ChadGPT Bot is online as ${c.user.tag}`);
  console.log(`📡 Listening for Chad's replies in channel ${DISCORD_CHANNEL_ID}`);
});

client.on(Events.MessageCreate, async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Only process messages from Chad
  if (message.author.id !== CHAD_DISCORD_USER_ID) return;

  // Only process messages in threads under our channel
  if (!message.channel.isThread()) return;
  if (message.channel.parentId !== DISCORD_CHANNEL_ID) return;

  const threadId = message.channel.id;

  try {
    // Find the conversation linked to this thread
    const conversation = await prisma.conversation.findUnique({
      where: { discordThreadId: threadId },
    });

    if (!conversation) {
      console.log(`No conversation found for thread ${threadId}`);
      return;
    }

    // Save Chad's reply to the database
    await prisma.message.create({
      data: {
        content: message.content,
        role: "chad",
        conversationId: conversation.id,
      },
    });

    console.log(`💬 Saved Chad's reply to conversation ${conversation.id.slice(0, 8)}`);
  } catch (err) {
    console.error("Error processing Discord message:", err);
  }
});

client.login(DISCORD_BOT_TOKEN);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down bot...");
  await prisma.$disconnect();
  client.destroy();
  process.exit(0);
});
