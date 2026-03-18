/**
 * In-memory conversation store.
 * Uses globalThis to persist across hot reloads in development.
 * All data is lost on server restart — by design.
 */

if (!globalThis.__chadgptStore) {
  globalThis.__chadgptStore = {
    // conversationId -> { messages: [], discordThreadId: null }
    conversations: new Map(),
  };
}

const store = globalThis.__chadgptStore;

export function getConversation(id) {
  return store.conversations.get(id) || null;
}

export function ensureConversation(id) {
  if (!store.conversations.has(id)) {
    store.conversations.set(id, { messages: [], discordThreadId: null });
  }
  return store.conversations.get(id);
}

export function addMessage(conversationId, { content, role, attachmentUrl, attachmentType }) {
  const conv = ensureConversation(conversationId);
  const message = {
    id: crypto.randomUUID(),
    content,
    role,
    attachmentUrl: attachmentUrl || null,
    attachmentType: attachmentType || null,
    conversationId,
    createdAt: new Date().toISOString(),
  };
  conv.messages.push(message);
  return message;
}

export function getMessages(conversationId) {
  const conv = store.conversations.get(conversationId);
  return conv ? conv.messages : [];
}

export function setThreadId(conversationId, threadId) {
  const conv = ensureConversation(conversationId);
  conv.discordThreadId = threadId;
}

export function getThreadId(conversationId) {
  const conv = store.conversations.get(conversationId);
  return conv?.discordThreadId || null;
}

/** Find conversation ID by Discord thread ID */
export function findConversationByThread(threadId) {
  for (const [id, conv] of store.conversations) {
    if (conv.discordThreadId === threadId) return id;
  }
  return null;
}
