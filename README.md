# ChadGPT

LIVE @ https://chadgpt.fly.dev

A spoof ChatGPT website where users think they're talking to an AI, but they're actually messaging a real human named Chad (me). Built as a fun joke project.

## How It Works

```
User on chadgpt.cm  →  Next.js API  →  Save to DB  →  Post to Discord thread
                                                              ↓
User sees reply     ←  Frontend polls ←  DB         ←  Chad replies in thread
                                                     ←  Bot detects reply, saves to DB
```

1. A visitor sends a message on the website
2. The message is saved to the database and forwarded to a Discord thread
3. Chad sees the thread in Discord and replies
4. The Discord bot detects the reply and saves it to the database
5. The website polls every 3 seconds and displays Chad's response

## Tech Stack

- **Frontend** — React + Tailwind CSS (ChatGPT-style dark UI)
- **Backend** — Next.js API routes
- **Database** — SQLite via Prisma
- **Messaging** — Discord bot (discord.js)
- **Dev Tooling** — Tilt

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Tilt](https://tilt.dev/) (optional, for local dev)
- A Discord account

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

```bash
npx prisma db push
```

### 3. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → name it "ChadGPT"
3. Go to the **Bot** tab → click **Reset Token** → copy the token
4. Enable **Message Content Intent** under Privileged Gateway Intents
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Create Public Threads`, `Send Messages in Threads`, `Read Message History`
6. Open the generated URL to invite the bot to your server
7. Create a channel in your server (e.g. `#chadgpt-messages`)
8. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
9. Right-click the channel → **Copy Channel ID**
10. Right-click your own profile → **Copy User ID**

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CHANNEL_ID=your_channel_id
CHAD_DISCORD_USER_ID=your_discord_user_id
```

### 5. Run the project

**With Tilt (recommended):**

```bash
tilt up
```

This starts both the web app and Discord bot with a dashboard at http://localhost:10350.

**Without Tilt:**

```bash
# Terminal 1 — Web app
npm run dev

# Terminal 2 — Discord bot
npm run bot
```

The website will be available at http://localhost:3000.

## Project Structure

```
src/
├── app/
│   ├── api/messages/route.js   # REST API for sending/receiving messages
│   ├── globals.css             # Global styles (dark theme, animations)
│   ├── layout.jsx              # Root HTML layout
│   └── page.jsx                # Homepage
├── bot/
│   └── index.js                # Discord bot — listens for Chad's replies
├── components/
│   ├── Chat.jsx                # Main chat interface with polling
│   ├── Header.jsx              # Top bar with branding
│   ├── MessageBubble.jsx       # Individual message display
│   └── MessageInput.jsx        # Auto-resizing text input
└── lib/
    ├── discord-api.js          # Sends user messages to Discord threads
    └── prisma.js               # Shared database client
prisma/
└── schema.prisma               # Database schema (Conversation + Message)
Tiltfile                        # Local dev orchestration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js dev server |
| `npm run bot` | Start the Discord bot |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run db:push` | Sync database with schema |
| `npm run db:studio` | Open Prisma Studio (DB browser) |
| `tilt up` | Start everything with Tilt dashboard |
