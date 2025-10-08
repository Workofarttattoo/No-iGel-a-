import { Router } from "express";
import { listPersonas } from "../services/personaService.js";
export const personaRouter = Router();
personaRouter.get("/", async (_req, res, next) => {
    try {
        const personas = await listPersonas();
        res.json({ personas });
    }
    catch (error) {
        next(error);
    }
});
