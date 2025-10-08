import { Router } from "express";
import { z } from "zod";
import { streamChatCompletion } from "../services/chatService.js";
import { Readable } from "stream";
import { ReadableStream as NodeReadableStream } from "stream/web";
import { analyzeMessage } from "../utils/safety.js";
import { saveChatHistory, getChatHistory } from "../services/chatHistoryService.js";
import { recordIncident } from "../services/moderationService.js";

const chatSchema = z.object({
  personaId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string()
    })
  )
});

const historySchema = z.object({
  personaId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
      createdAt: z.string()
    })
  )
});

const historyQuerySchema = z.object({
  personaId: z.string()
});

export const chatRouter = Router();

chatRouter.post("/stream", async (req, res, next) => {
  try {
    const payload = chatSchema.parse(req.body);

    const violation = payload.messages.find((message) => {
      if (message.role !== "user") {
        return false;
      }
      const analysis = analyzeMessage(message.content);
      if (analysis.blocked) {
        const userId = req.auth?.userId ?? "anonymous";
        recordIncident({
          userId,
          personaId: payload.personaId,
          message: message.content,
          matches: analysis.matches
        });
        res.status(400).json({ error: "Message rejected by safety filter", matches: analysis.matches });
        return true;
      }
      return false;
    });

    if (violation) {
      return;
    }

    const stream = await streamChatCompletion(payload.personaId, payload.messages);
    if (!stream) {
      throw new Error("Missing stream body");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const nodeStream = Readable.fromWeb(stream as unknown as NodeReadableStream<Uint8Array>);

    nodeStream.on("data", (chunk) => {
      res.write(chunk);
    });
    nodeStream.on("end", () => {
      res.end();
    });
    nodeStream.on("error", (error) => {
      res.status(500).end(`event: error\ndata: ${error instanceof Error ? error.message : "Unknown"}\n\n`);
    });
  } catch (error) {
    next(error);
  }
});

chatRouter.get("/history", async (req, res, next) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { personaId } = historyQuerySchema.parse(req.query);
    const history = getChatHistory(userId, personaId);
    res.json({ personaId, messages: history?.messages ?? [] });
  } catch (error) {
    next(error);
  }
});

chatRouter.post("/history", async (req, res, next) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = historySchema.parse(req.body);
    const sanitized = payload.messages.filter((message) => message.role !== "system");
    await saveChatHistory(userId, payload.personaId, sanitized);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
