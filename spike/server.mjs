import { createServer } from "http";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const CLIENT_HTML = join(MODULE_DIR, "client.html");
const CLIENT_JS = join(MODULE_DIR, "client.js");

const PORT = Number.parseInt(process.env.SPIKE_PORT ?? "4173", 10);
const HOST = process.env.SPIKE_HOST ?? "127.0.0.1";
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

const sockets = new Set();

function buildMockEvent(sequence) {
  const advisors = new Array(6).fill(null).map((_, index) => {
    const phase = (sequence + index) % 3;
    const resonanceSeed = Math.sin((sequence + 1) * (index + 1) * 0.35);
    const resonance = Number.parseFloat(
      Math.max(0, Math.min(1, 0.55 + resonanceSeed * 0.35 + Math.random() * 0.1)).toFixed(3)
    );
    return {
      id: index,
      name: ["Helios", "Nyx", "Irides", "Solara", "Umbriel", "Caelum"][index],
      resonance,
      polarity: resonance > 0.7 ? "amplify" : resonance < 0.4 ? "attenuate" : "mediate",
      phase,
    };
  });

  const coherence = advisors.reduce((sum, advisor) => sum + advisor.resonance, 0) / advisors.length;

  return {
    timestamp: Date.now(),
    cycle: sequence,
    coherence: Number.parseFloat(coherence.toFixed(3)),
    advisors,
  };
}

async function serveFile(res, path, type) {
  try {
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-cache",
    });
    res.end(body);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Failed to read file: ${error.message}`);
  }
}

const server = createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad request");
    return;
  }

  if (req.url === "/") {
    serveFile(res, CLIENT_HTML, "text/html; charset=utf-8");
    return;
  }

  if (req.url.startsWith("/client.js")) {
    serveFile(res, CLIENT_JS, "application/javascript; charset=utf-8");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

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
    /* drain inbound frames; no-op */
  });

  socket.on("end", () => {
    sockets.delete(socket);
  });

  socket.on("error", () => {
    sockets.delete(socket);
  });
}

server.on("upgrade", (req, socket) => {
  if (req.url !== "/ws") {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }

  performHandshake(req, socket);
});

let sequence = 0;
setInterval(() => {
  const payload = buildMockEvent(sequence);
  payload.timestamp = Date.now();
  broadcast(payload);
  sequence += 1;
}, 1000);

server.listen(PORT, HOST, () => {
  const origin = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`[info] Spike server running at http://${origin}:${PORT}`);
  console.log("[info] WebSocket endpoint available at /ws");
});
