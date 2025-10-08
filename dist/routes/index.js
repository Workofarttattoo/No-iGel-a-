import { personaRouter } from "./personas.js";
import { chatRouter } from "./chat.js";
import { verificationRouter } from "./verification.js";
import { subscriptionRouter } from "./subscriptions.js";
import { authRouter } from "./auth.js";
import { requireAuth } from "../middleware/authMiddleware.js";
export const registerRoutes = (app) => {
    app.use("/auth", authRouter);
    app.use("/verification", verificationRouter);
    app.use("/personas", requireAuth, personaRouter);
    app.use("/chat", requireAuth, chatRouter);
    app.use("/subscriptions", subscriptionRouter);
};
