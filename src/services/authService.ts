import { randomUUID } from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

const ACCESS_TOKEN_TTL_SECONDS = 60 * 15; // 15 minutes
const refreshStore = new Map<string, { userId: string; issuedAt: number }>();

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export const issueTokenPair = async (userId: string): Promise<TokenPair> => {
  const accessToken = jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS
  });
  const refreshToken = randomUUID();
  refreshStore.set(refreshToken, { userId, issuedAt: Date.now() });
  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: ACCESS_TOKEN_TTL_SECONDS
  };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const rotateRefreshToken = async (refreshToken: string): Promise<TokenPair | null> => {
  const entry = refreshStore.get(refreshToken);
  if (!entry) {
    return null;
  }
  refreshStore.delete(refreshToken);
  return issueTokenPair(entry.userId);
};

export const revokeRefreshToken = (refreshToken: string) => {
  refreshStore.delete(refreshToken);
};
