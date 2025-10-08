import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
const ACCESS_TOKEN_TTL_SECONDS = 60 * 15; // 15 minutes
const refreshStore = new Map();
export const issueTokenPair = async (userId) => {
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
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};
export const rotateRefreshToken = async (refreshToken) => {
    const entry = refreshStore.get(refreshToken);
    if (!entry) {
        return null;
    }
    refreshStore.delete(refreshToken);
    return issueTokenPair(entry.userId);
};
export const revokeRefreshToken = (refreshToken) => {
    refreshStore.delete(refreshToken);
};
