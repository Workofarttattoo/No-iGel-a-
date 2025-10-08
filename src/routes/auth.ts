import { Router } from "express";
import { z } from "zod";
import { rotateRefreshToken, revokeRefreshToken } from "../services/authService.js";

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export const authRouter = Router();

authRouter.post("/token", async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = await rotateRefreshToken(refreshToken);
    if (!tokens) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    revokeRefreshToken(refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
