import { verifyAccessToken } from "../services/authService.js";
export const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Authorization header" });
    }
    const token = header.replace("Bearer", "").trim();
    try {
        const payload = verifyAccessToken(token);
        const userId = payload.sub;
        if (!userId) {
            return res.status(401).json({ error: "Invalid token payload" });
        }
        req.auth = { userId: String(userId) };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Invalid or expired access token" });
    }
};
