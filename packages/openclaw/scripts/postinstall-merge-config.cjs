/**
 * Postinstall: merge mindkeeper tools into OpenClaw config.
 * - If tools.allow exists: merge into tools.allow (allow and alsoAllow are mutually exclusive).
 * - Else: merge into tools.alsoAllow.
 * Runs during plugin install so a single gateway restart is enough.
 */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const TOOLS = [
  "mind_status",
  "mind_history",
  "mind_diff",
  "mind_rollback",
  "mind_snapshot",
];

function findConfigPath() {
  const home = os.homedir();
  if (!home) return null;

  const candidates = [
    process.env.OPENCLAW_CONFIG_PATH,
    process.env.CLAWDBOT_CONFIG_PATH,
    path.join(home, ".openclaw", "openclaw.json"),
    path.join(home, ".openclaw", "clawdbot.json"),
    path.join(home, ".clawdbot", "openclaw.json"),
    path.join(home, ".clawdbot", "clawdbot.json"),
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      const resolved = path.resolve(p.replace(/^~/, home));
      if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) return resolved;
    } catch {
      /* skip */
    }
  }
  const defaultPath = path.join(home, ".openclaw", "openclaw.json");
  if (fs.existsSync(defaultPath)) return defaultPath;
  return null;
}

function run() {
  const configPath = findConfigPath();
  if (!configPath) return;

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    return;
  }

  const allow = cfg.tools?.allow ?? [];
  const alsoAllow = cfg.tools?.alsoAllow ?? [];
  const target = allow.length > 0 ? allow : alsoAllow;
  const key = allow.length > 0 ? "allow" : "alsoAllow";

  const existing = new Set(
    target.map((e) => String(e).trim().toLowerCase()).filter(Boolean),
  );
  const needed = TOOLS.filter((t) => !existing.has(t));
  if (needed.length === 0) return;

  for (const t of needed) existing.add(t);
  cfg.tools = { ...cfg.tools, [key]: Array.from(existing) };

  try {
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), "utf-8");
  } catch {
    /* ignore */
  }
}

run();
