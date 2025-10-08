import { randomUUID } from "crypto";
const users = new Map();
export const ensureUser = async (id) => {
    const userId = id ?? randomUUID();
    const existing = users.get(userId);
    if (existing) {
        return existing;
    }
    const created = {
        id: userId,
        createdAt: new Date().toISOString()
    };
    users.set(userId, created);
    return created;
};
export const markUserVerified = async (userId, verificationId, assetKey) => {
    const user = await ensureUser(userId);
    const verifiedAt = new Date().toISOString();
    const updated = {
        ...user,
        verificationId,
        idAssetKey: assetKey,
        verifiedAt
    };
    users.set(userId, updated);
    return updated;
};
export const getUserById = (userId) => {
    return users.get(userId) ?? null;
};
