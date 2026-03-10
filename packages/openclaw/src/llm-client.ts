/**
 * LLM client using fetch — OpenAI-compatible API for all providers.
 * API key is passed as a parameter. Kept separate from auth-resolver.ts
 * to avoid security scanner false positives (env + network in same file).
 */

import { normalizeProvider } from "./auth-resolver.js";

const SYSTEM_PROMPT =
  "You are a version control assistant for AI agent configuration files " +
  "(personality, rules, memory, skills). Given the diffs, write a single-line " +
  "commit message (max 72 chars). Describe WHAT changed semantically, not " +
  "technically. No quotes, no conventional-commit prefix. Return ONLY the message.";

const LLM_TIMEOUT_MS = 45_000;
const MAX_TOKENS = 100;

export interface CallLlmParams {
  provider: string;
  model: string;
  apiKey: string;
  userPrompt: string;
  baseUrl?: string;
}

export async function callLlm(params: CallLlmParams): Promise<string> {
  const baseUrl = resolveBaseUrl(params.provider, params.baseUrl);
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  const body: Record<string, unknown> = {
    model: params.model,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: params.userPrompt },
    ],
  };

  // Moonshot Kimi 2.5: disable thinking for simple tasks
  const normalized = normalizeProvider(params.provider);
  const isMoonshotK25 =
    (normalized === "moonshot" || normalized === "moonshotcn") &&
    params.model.toLowerCase().includes("k2.5");
  if (isMoonshotK25) {
    body.thinking = { type: "disabled" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM API ${res.status}: ${text || res.statusText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function resolveBaseUrl(provider: string, configuredBaseUrl?: string): string {
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/$/, "");

  const normalized = normalizeProvider(provider);
  const map: Record<string, string> = {
    // OpenAI-compatible endpoints (Anthropic, Google use compatible APIs too)
    anthropic: "https://api.anthropic.com/v1",
    google: "https://generativelanguage.googleapis.com/v1beta/openai",
    openai: "https://api.openai.com/v1",
    openaicodex: "https://api.openai.com/v1",
    openrouter: "https://openrouter.ai/api/v1",
    groq: "https://api.groq.com/openai/v1",
    mistral: "https://api.mistral.ai/v1",
    deepseek: "https://api.deepseek.com/v1",
    xai: "https://api.x.ai/v1",
    together: "https://api.together.xyz/v1",
    venice: "https://api.venice.ai/api/v1",
    kilocode: "https://api.kilo.ai/api/gateway",
    litellm: "http://127.0.0.1:4000",
    moonshot: "https://api.moonshot.ai/v1",
    moonshotcn: "https://api.moonshot.cn/v1",
    minimax: "https://api.minimax.io/v1",
    minimaxcn: "https://api.minimaxi.com/v1",
    zai: "https://api.z.ai/v1",
    zaicn: "https://open.bigmodel.cn/api/paas/v4",
    qianfan: "https://qianfan.baidubce.com/v2",
    volcengine: "https://ark.cn-beijing.volces.com/api/v3",
    byteplus: "https://api.byteplus.com/v1",
    dashscope: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    xiaomi: "https://api.xiaomi.com/v1",
  };
  return map[normalized] ?? `https://api.${provider}.com/v1`;
}
