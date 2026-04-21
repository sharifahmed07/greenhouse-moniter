const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

if (!fs.existsSync(nextBin)) {
  console.error(`Next CLI not found at ${nextBin}`);
  process.exit(1);
}

const env = {
  ...process.env,
  NODE_PATH: path.join(projectRoot, "node_modules"),
};

const result = spawnSync(process.execPath, [nextBin, ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 1);
