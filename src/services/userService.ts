import { randomUUID } from "crypto";

type User = {
  id: string;
  createdAt: string;
  verifiedAt?: string;
  verificationId?: string;
  idAssetKey?: string;
};

type UserStore = Map<string, User>;

const users: UserStore = new Map();

export const ensureUser = async (id?: string): Promise<User> => {
  const userId = id ?? randomUUID();
  const existing = users.get(userId);
  if (existing) {
    return existing;
  }
  const created: User = {
    id: userId,
    createdAt: new Date().toISOString()
  };
  users.set(userId, created);
  return created;
};

export const markUserVerified = async (userId: string, verificationId: string, assetKey: string) => {
  const user = await ensureUser(userId);
  const verifiedAt = new Date().toISOString();
  const updated: User = {
    ...user,
    verificationId,
    idAssetKey: assetKey,
    verifiedAt
  };
  users.set(userId, updated);
  return updated;
};

export const getUserById = (userId: string) => {
  return users.get(userId) ?? null;
};

export type { User };
