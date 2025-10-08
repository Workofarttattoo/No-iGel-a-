import Docker from "dockerode";

const socketPath = process.env.DOCKER_SOCKET || "/var/run/docker.sock";
const docker = new Docker({ socketPath });

async function streamLogs(container) {
  const logStream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true,
    tail: 10,
  });

  logStream.on("data", (chunk) => {
    const output = chunk.toString("utf8");
    output
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => console.log(`[log] ${line}`));
  });

  return logStream;
}

async function streamStats(container) {
  const statsStream = await container.stats({ stream: true });

  statsStream.on("data", (chunk) => {
    try {
      const json = JSON.parse(chunk.toString("utf8"));
      const cpu = json.cpu_stats?.cpu_usage?.total_usage;
      const memory = json.memory_stats?.usage;
      console.log(`{ cpuUsage: ${cpu}, memoryUsage: ${memory} }`);
    } catch (err) {
      console.warn("[stats] Unable to parse stats payload", err.message);
    }
  });

  return statsStream;
}

async function runSmokeTest() {
  try {
    await docker.ping();
  } catch (error) {
    console.warn(
      `[warn] Unable to reach Docker daemon at ${socketPath}: ${error.message}`
    );
    console.warn("[warn] Skipping log/stats stream smoke test.");
    return;
  }

  const preferredId = process.env.DOCKER_CONTAINER_ID;
  const containers = await docker.listContainers({ limit: 1 });
  const targetId = preferredId || containers[0]?.Id;

  if (!targetId) {
    console.log("[info] No running containers available for streaming test.");
    return;
  }

  const container = docker.getContainer(targetId);
  console.log(`[info] Streaming logs and stats for container ${targetId}`);

  const logStream = await streamLogs(container);
  const statsStream = await streamStats(container);

  setTimeout(() => {
    logStream.destroy();
    statsStream.destroy();
    console.log("[info] Smoke test completed");
  }, 5000);
}

runSmokeTest().catch((error) => {
  console.error("[error] Smoke test failed", error);
  process.exitCode = 1;
});
