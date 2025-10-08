import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SCRIPT_DIR, "..");
const DIST_DIR = join(PROJECT_ROOT, "dist");

const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const OUTPUT = join(DIST_DIR, `boardroom-of-light_${STAMP}.zip`);
const INCLUDE = [
  "README.md",
  "package.json",
  "package-lock.json",
  "docs",
  "scripts",
  "web/noigela-companion",
  "spike",
  "tests",
];

async function run() {
  await mkdir(DIST_DIR, { recursive: true });

  return new Promise((resolve, reject) => {
    const zip = spawn("zip", ["-r", OUTPUT, ...INCLUDE], {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
    });

    zip.on("close", (code) => {
      if (code === 0) {
        console.log(`[info] Release package created at ${OUTPUT}`);
        resolve();
      } else {
        reject(new Error(`zip exited with code ${code}`));
      }
    });

    zip.on("error", (error) => {
      reject(error);
    });
  });
}

run().catch((error) => {
  console.error(`[error] Failed to create release zip: ${error.message}`);
  process.exitCode = 1;
});
