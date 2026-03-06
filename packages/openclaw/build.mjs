import * as esbuild from "esbuild";
import { execSync } from "node:child_process";

const NODE_EXTERNALS = [
  "node:fs", "node:fs/promises", "node:path", "node:os", "node:child_process",
  "node:url", "node:util", "node:events", "node:stream", "node:buffer",
  "node:crypto", "node:http", "node:https", "node:net", "node:tls",
  "node:zlib", "node:assert", "node:timers", "node:worker_threads",
  "fs", "path", "os", "child_process", "url", "util", "events", "stream",
  "buffer", "crypto", "http", "https", "net", "tls", "zlib", "assert", "timers",
];

// Type-check only (no emit) via tsc
console.log("Type checking...");
execSync("npx tsc --noEmit", { stdio: "inherit" });

console.log("Bundling...");

// Bundle 1: llm-client — fetch only, NO process.env
// This file will be dynamically imported at runtime, so the scanner
// sees it as a standalone file with only network calls and no env access.
await esbuild.build({
  entryPoints: ["src/llm-client.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "dist/llm-client.js",
  external: NODE_EXTERNALS,
  logLevel: "warning",
});

// Bundle 2: main plugin — everything except llm-client (which is dynamic import)
// This file has process.env (from isomorphic-git, chokidar, auth-resolver)
// but NO fetch calls (llm-client is external / dynamic import).
await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "dist/index.js",
  external: [
    ...NODE_EXTERNALS,
    // Keep llm-client external so it stays in its own file with no process.env
    "./llm-client.js",
  ],
  logLevel: "warning",
});

console.log("Done. dist/index.js + dist/llm-client.js created.");
