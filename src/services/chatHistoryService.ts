import { randomUUID } from "crypto";
import { ChatMessage } from "./chatService.js";

type ChatHistoryRecord = {
  id: string;
  userId: string;
  personaId: string;
  messages: ChatMessage[];
  updatedAt: string;
};

const chatHistory = new Map<string, ChatHistoryRecord>();

const keyFor = (userId: string, personaId: string) => `${userId}:${personaId}`;

export const saveChatHistory = async (userId: string, personaId: string, messages: ChatMessage[]): Promise<ChatHistoryRecord> => {
  const updatedAt = new Date().toISOString();
  const key = keyFor(userId, personaId);
  const existing = chatHistory.get(key);
  const record: ChatHistoryRecord = existing
    ? { ...existing, messages, updatedAt }
    : {
        id: randomUUID(),
        userId,
        personaId,
        messages,
        updatedAt
      };
  chatHistory.set(key, record);
  return record;
};

export const getChatHistory = (userId: string, personaId: string): ChatHistoryRecord | null => {
  const record = chatHistory.get(keyFor(userId, personaId));
  return record ?? null;
};

export type { ChatHistoryRecord };
