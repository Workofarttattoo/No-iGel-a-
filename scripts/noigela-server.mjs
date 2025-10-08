import { createServer } from "http";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

import {
  runMultiverse,
  buildMultiverseFromBoardrooms,
  structureResult,
} from "./boardroom-multiverse.js";
import { NoigelaModule } from "@gavl/noigela";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(MODULE_DIR, "..", "web", "noigela-companion");
const PORT = Number.parseInt(process.env.JIMMINY_PORT ?? "4180", 10);
const HOST = process.env.JIMMINY_HOST ?? "127.0.0.1";
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const AUTONOMY_COOLDOWN_MS = Number.parseInt(
  process.env.JIMMINY_AUTONOMY_COOLDOWN_MS ?? "10000",
  10,
);

const sockets = new Set();
const noigela = new NoigelaModule({ mode: "analysis" });
let lastInjectionAt = 0;
let lastReport = null;

async function serveStatic(res, path, type) {
  try {
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-cache",
    });
    res.end(body);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
  }
}

const server = createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("bad request");
    return;
  }

  if (req.method === "POST" && req.url === "/ingest") {
    handleIngest(req, res);
    return;
  }

  if (req.url === "/api/latest") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      multiverse: lastReport,
    }));
    return;
  }

  if (req.url === "/" || req.url === "/index.html") {
    serveStatic(res, join(WEB_ROOT, "index.html"), "text/html; charset=utf-8");
    return;
  }

  if (req.url === "/styles.css") {
    serveStatic(res, join(WEB_ROOT, "styles.css"), "text/css; charset=utf-8");
    return;
  }

  if (req.url === "/noigela.js") {
    serveStatic(res, join(WEB_ROOT, "noigela.js"), "application/javascript; charset=utf-8");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("not found");
});

function handleIngest(req, res) {
  let body = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const report = normalizeIncomingPayload(payload);
      lastInjectionAt = Date.now();
      dispatchMultiverse(report);
      res.writeHead(202, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "accepted" }));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "error", error: error.message }));
    }
  });
  req.on("error", (error) => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "error", error: error.message }));
  });
}

function buildFrame(payload) {
  const json = Buffer.from(JSON.stringify(payload));
  const length = json.length;

  if (length < 126) {
    const frame = Buffer.alloc(2 + length);
    frame[0] = 0x81;
    frame[1] = length;
    json.copy(frame, 2);
    return frame;
  }

  if (length < 65536) {
    const frame = Buffer.alloc(4 + length);
    frame[0] = 0x81;
    frame[1] = 126;
    frame.writeUInt16BE(length, 2);
    json.copy(frame, 4);
    return frame;
  }

  const frame = Buffer.alloc(10 + length);
  frame[0] = 0x81;
  frame[1] = 127;
  frame.writeBigUInt64BE(BigInt(length), 2);
  json.copy(frame, 10);
  return frame;
}

function broadcast(payload) {
  const frame = buildFrame(payload);
  for (const socket of sockets) {
    if (socket.destroyed) {
      sockets.delete(socket);
      continue;
    }
    socket.write(frame, (error) => {
      if (error) {
        sockets.delete(socket);
        socket.destroy();
      }
    });
  }
}

function performHandshake(req, socket) {
  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\nMissing Sec-WebSocket-Key");
    socket.destroy();
    return;
  }

  const accept = createHash("sha1").update(key + WS_GUID).digest("base64");
  const responseHeaders = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
  ];

  socket.write(`${responseHeaders.join("\r\n")}\r\n\r\n`);
  socket.setNoDelay(true);
  sockets.add(socket);

  socket.on("data", () => {
    /* ignoring inbound */
  });

  socket.on("end", () => {
    sockets.delete(socket);
  });

  socket.on("error", () => {
    sockets.delete(socket);
  });
}

server.on("upgrade", (req, socket) => {
  if (req.url !== "/noigela") {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }

  performHandshake(req, socket);
});

function formatWhisper(multiverse) {
  const report = multiverse.noigela;
  const mood = report.conscienceScore >= 0.25
    ? "celebrate"
    : report.conscienceScore <= -0.25
      ? "concern"
      : "idle";

  return {
    type: "whisper",
    timestamp: report.timestamp,
    message: report.innerMonologue?.message ?? "Signal pending...",
    mood,
    conscienceScore: report.conscienceScore,
    recommendations: report.recommendations,
    watchlist: report.watchlist,
    evidence: multiverse.comparison.evidence,
  };
}

function dispatchMultiverse(multiverse) {
  lastReport = multiverse;
  broadcast(formatWhisper(multiverse));
}

function normalizeIncomingPayload(payload) {
  if (payload?.boardrooms?.light && payload?.boardrooms?.authentic) {
    return buildMultiverseFromBoardrooms(payload.boardrooms.light, payload.boardrooms.authentic, { advisor: noigela });
  }

  if (payload?.lightResult && payload?.authenticResult) {
    const light = structureResult(payload.lightResult);
    const authentic = structureResult(payload.authenticResult);
    return buildMultiverseFromBoardrooms(light, authentic, { advisor: noigela });
  }

  if (payload?.multiverse?.boardrooms?.light && payload?.multiverse?.boardrooms?.authentic) {
    return buildMultiverseFromBoardrooms(payload.multiverse.boardrooms.light, payload.multiverse.boardrooms.authentic, { advisor: noigela });
  }

  throw new Error("Unsupported payload for /ingest. Provide boardrooms.light and .authentic or lightResult/authenticResult.");
}

async function broadcastLoop() {
  try {
    if (Date.now() - lastInjectionAt < AUTONOMY_COOLDOWN_MS) {
      if (lastReport) {
        broadcast(formatWhisper(lastReport));
      }
      return;
    }

    const multiverse = await runMultiverse({ seats: 7, rounds: 3, advisor: noigela });
    dispatchMultiverse(multiverse);
  } catch (error) {
    broadcast({
      type: "whisper",
      timestamp: Date.now(),
      mood: "concern",
      message: `No'iGeL(a) faltered: ${error.message}`,
      conscienceScore: -1,
    });
  }
}

setInterval(broadcastLoop, 7000);

server.listen(PORT, HOST, () => {
  const origin = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`[info] No'iGeL(a) advisor server at http://${origin}:${PORT}`);
  console.log("[info] Open the URL in a browser to view the companion and connect to /noigela for whispers.");
});

broadcastLoop();
