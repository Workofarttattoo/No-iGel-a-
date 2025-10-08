import { spawn } from "child_process";
import { once } from "events";
import { setTimeout as delay } from "timers/promises";
import assert from "node:assert/strict";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BoardroomOfLightSimulator } from "../scripts/boardroom-simulator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");

async function startServer() {
  const server = spawn("node", ["scripts/noigela-server.mjs"], {
    cwd: PROJECT_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let resolved = false;
  const readyPromise = new Promise((resolve, reject) => {
    server.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (!resolved && text.includes(No'iGeL(a) advisor server)) {
        resolved = true;
        resolve();
      }
    });
    server.stderr.on("data", (chunk) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(chunk.toString("utf8")));
      }
    });
    server.on("exit", (code) => {
      if (!resolved) {
        reject(new Error(`No'iGeL(a) server exited prematurely with code ${code}`));
      }
    });
  });

  await readyPromise;
  return server;
}

async function stopServer(server) {
  if (!server.killed) {
    server.kill();
    try {
      await once(server, "exit");
    } catch (error) {
      // best effort cleanup
    }
  }
}

async function fetchText(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `Expected 200 from ${url}, received ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `Expected 200 from ${url}, received ${response.status}`);
  return response.json();
}

async function runSmoke() {
  const server = await startServer();
  try {
    const html = await fetchText("http://127.0.0.1:4180/");
    assert.ok(html.includes(No'iGeL(a) Whisper Log), "Missing whisper log heading");
    assert.ok(html.includes("<canvas id=\"noigela-canvas\""), "Canvas element not found");

    const script = await fetchText("http://127.0.0.1:4180/noigela.js");
    assert.ok(script.includes("function buildWireSphere"), "No'iGeL(a) wireframe builder missing");
    assert.ok(script.includes("mode === \"celebrate\""), "Celebrate animation branch not detected");

    const lightResult = await new BoardroomOfLightSimulator({
      realm: "light",
      seats: 7,
      rounds: 2,
    }).run();

    const authenticResult = await new BoardroomOfLightSimulator({
      realm: "authentic",
      seats: 7,
      rounds: 2,
    }).run();

    const ingestResponse = await fetch("http://127.0.0.1:4180/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lightResult,
        authenticResult,
      }),
    });
    assert.equal(ingestResponse.status, 202, "Expected 202 from /ingest");

    await delay(500);

    const latest = await fetchJson("http://127.0.0.1:4180/api/latest");
    assert.equal(latest.status, "ok", "Latest endpoint did not return ok status");
    assert.ok(latest.multiverse?.boardrooms?.light, "Latest payload missing light boardroom");
    assert.ok(latest.multiverse?.boardrooms?.authentic, "Latest payload missing authentic boardroom");
    assert.ok(Array.isArray(latest.multiverse?.comparison?.hatContrasts), "Hat contrasts missing");
    assert.ok(typeof latest.multiverse?.noigela?.conscienceScore === "number", "Conscience score missing");
  } finally {
    await stopServer(server);
  }
}

runSmoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
