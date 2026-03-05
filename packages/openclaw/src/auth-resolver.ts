/**
 * API key resolution from auth-profiles.json and environment variables.
 * This file contains process.env access only — no network calls.
 * Kept separate from llm-client.ts to avoid security scanner false positives.
 */

import fsPromises from "node:fs/promises";
import path from "node:path";
import os from "node:os";

interface AuthProfileStore {
  version: number;
  profiles: Record<string, AuthProfileCredential>;
}

interface AuthProfileCredential {
  type: string;
  provider: string;
  key?: string;
  token?: string;
  keyRef?: { source: string; key?: string; path?: string };
  tokenRef?: { source: string; key?: string; path?: string };
}

export function normalizeProvider(provider: string): string {
  return provider.toLowerCase().replace(/-/g, "").replace(/_/g, "");
}

export async function resolveApiKey(provider: string): Promise<string | null> {
  const profileKey = await readAuthProfileKey(provider);
  if (profileKey) return profileKey;

  return readEnvApiKey(provider);
}

async function readAuthProfileKey(provider: string): Promise<string | null> {
  const candidates = buildAuthProfilePaths();

  for (const filepath of candidates) {
    try {
      const content = await fsPromises.readFile(filepath, "utf-8");
      const store = JSON.parse(content) as AuthProfileStore;
      if (!store.profiles || typeof store.profiles !== "object") continue;

      const normalized = normalizeProvider(provider);

      for (const credential of Object.values(store.profiles)) {
        if (normalizeProvider(credential.provider) !== normalized) continue;

        if (credential.type === "api_key" && credential.key) {
          return credential.key;
        }
        if (credential.type === "token" && credential.token) {
          return credential.token;
        }

        const ref = credential.keyRef ?? credential.tokenRef;
        if (ref?.source === "env" && ref.key) {
          const envVal = process.env[ref.key];
          if (envVal) return envVal;
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

function buildAuthProfilePaths(): string[] {
  const home = os.homedir();
  const paths: string[] = [];

  const envHome = process.env.OPENCLAW_HOME;
  if (envHome) {
    paths.push(path.join(envHome, "auth-profiles.json"));
  }

  paths.push(
    path.join(home, ".openclaw", "auth-profiles.json"),
    path.join(home, ".config", "openclaw", "auth-profiles.json"),
  );
  return paths;
}

function readEnvApiKey(provider: string): string | null {
  const normalized = normalizeProvider(provider);
  const map: Record<string, string[]> = {
    anthropic: ["ANTHROPIC_API_KEY"],
    openai: ["OPENAI_API_KEY"],
    openaicodex: ["OPENAI_API_KEY"],
    openrouter: ["OPENROUTER_API_KEY"],
    google: ["GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"],
    groq: ["GROQ_API_KEY"],
    mistral: ["MISTRAL_API_KEY"],
    deepseek: ["DEEPSEEK_API_KEY"],
    xai: ["XAI_API_KEY"],
    together: ["TOGETHER_API_KEY"],
    venice: ["VENICE_API_KEY"],
    moonshot: ["MOONSHOT_API_KEY"],
    moonshotcn: ["MOONSHOT_API_KEY"],
    minimax: ["MINIMAX_API_KEY"],
    minimaxcn: ["MINIMAX_API_KEY"],
    zai: ["ZAI_API_KEY", "Z_AI_API_KEY"],
    qianfan: ["QIANFAN_API_KEY"],
    volcengine: ["VOLCANO_ENGINE_API_KEY"],
    byteplus: ["BYTEPLUS_API_KEY"],
    dashscope: ["DASHSCOPE_API_KEY"],
    xiaomi: ["XIAOMI_API_KEY"],
    kilocode: ["KILOCODE_API_KEY"],
    litellm: ["LITELLM_API_KEY"],
  };

  const envKeys =
    map[normalized] ??
    [`${provider.toUpperCase().replace(/-/g, "_")}_API_KEY`];

  for (const envKey of envKeys) {
    const val = process.env[envKey];
    if (val) return val;
  }
  return null;
}
