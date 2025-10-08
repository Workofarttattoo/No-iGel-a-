import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: env.NODE_ENV === "production" ? ["https://base44.app", "https://app.base44.app"] : true,
    credentials: true
  }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp());

  registerRoutes(app);

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok", env: env.NODE_ENV });
  });

  app.use(errorHandler);

  return app;
};
