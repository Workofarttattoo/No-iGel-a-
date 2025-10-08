import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { activateSubscription, getSubscription } from "../services/subscriptionService.js";

const subscriptionSchema = z.object({
  productId: z.string(),
  platform: z.enum(["ios", "android", "web"]),
  receipt: z.string()
});

export const subscriptionRouter = Router();

subscriptionRouter.post("/activate", requireAuth, async (req, res, next) => {
  try {
    const payload = subscriptionSchema.parse(req.body);
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const subscription = activateSubscription(userId, payload.productId);
    res.json({ subscription });
  } catch (error) {
    next(error);
  }
});

subscriptionRouter.get("/status", requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const subscription = getSubscription(userId);
    res.json({ subscription });
  } catch (error) {
    next(error);
  }
});

subscriptionRouter.post("/webhook", async (req, res) => {
  res.status(202).json({ received: true });
});
