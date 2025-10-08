import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { acknowledgeConsent, storeIdFront } from "../services/verificationService.js";
import { ensureUser, markUserVerified } from "../services/userService.js";
import { issueTokenPair } from "../services/authService.js";
const consentSchema = z.object({
    consent: z.literal(true),
    verificationId: z.string().min(1)
});
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 }
});
export const verificationRouter = Router();
verificationRouter.post("/id-front", upload.single("idFront"), async (req, res, next) => {
    try {
        const userId = req.header("x-device-id");
        if (!userId) {
            return res.status(400).json({ error: "Missing x-device-id header" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "ID image is required" });
        }
        await ensureUser(userId);
        const record = await storeIdFront(req.file.buffer, userId);
        res.json({ record });
    }
    catch (error) {
        next(error);
    }
});
verificationRouter.post("/consent", async (req, res, next) => {
    try {
        const userId = req.header("x-device-id");
        if (!userId) {
            return res.status(400).json({ error: "Missing x-device-id header" });
        }
        const payload = consentSchema.parse(req.body);
        const record = await acknowledgeConsent(payload.verificationId);
        if (record.userId !== userId) {
            return res.status(403).json({ error: "Verification does not match requester" });
        }
        const user = await markUserVerified(userId, record.id, record.bucketKey);
        const tokens = await issueTokenPair(user.id);
        res.json({ user, verification: record, tokens });
    }
    catch (error) {
        next(error);
    }
});
