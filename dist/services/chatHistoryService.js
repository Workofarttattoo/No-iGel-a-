import { randomUUID } from "crypto";
const chatHistory = new Map();
const keyFor = (userId, personaId) => `${userId}:${personaId}`;
export const saveChatHistory = async (userId, personaId, messages) => {
    const updatedAt = new Date().toISOString();
    const key = keyFor(userId, personaId);
    const existing = chatHistory.get(key);
    const record = existing
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
export const getChatHistory = (userId, personaId) => {
    const record = chatHistory.get(keyFor(userId, personaId));
    return record ?? null;
};
