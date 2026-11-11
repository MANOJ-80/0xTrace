/**
 * Multi-provider LLM client with automatic fallback.
 *
 * Chain (highest priority first):
 *   Groq → Cohere → NVIDIA NIM → OpenRouter → Ollama (local, opt-in)
 *
 * Every provider is given a hard timeout, JSON mode is requested where the
 * provider supports it, and 429/5xx responses are retried once before the
 * chain moves on. All calls log provider/model/latency/tokens so quota
 * exhaustion is visible instead of silent.
 */

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  tokens_used?: number;
}

export interface LLMCallResult<T = any> {
  data: T;
  provider: string;
  model: string;
  tokens_used?: number;
}

type ProviderStyle = "openai" | "cohere";

interface ProviderConfig {
  name: string;
  style: ProviderStyle;
  url: string;
  apiKey: string;
  model: string;
  headers: Record<string, string>;
  timeoutMs: number;
  maxAttempts: number;
  /** Reasoning models need headroom or they return empty `content`. */
  minTokens?: number;
  /** Some providers reject `response_format`; skip it for them. */
  jsonMode: boolean;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_CHAIN_BUDGET_MS = 50_000;
const RETRY_DELAY_MS = 1_200;

const APP_USER_AGENT = "0xTrace/1.0 (+https://0xtrace.vercel.app)";

function numberFromEnv(name: string, fallback: number): number {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    providers.push({
      name: "groq",
      style: "openai",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      // llama-3.3-70b-versatile is Enterprise-only now. gpt-oss-120b is the
      // tested free model: ~1s, clean JSON, 30 RPM / 8K TPM.
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
        "User-Agent": APP_USER_AGENT,
        Accept: "application/json",
      },
      timeoutMs: numberFromEnv("LLM_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
      maxAttempts: 2,
      jsonMode: true,
    });
  }

  const cohereKey = process.env.COHERE_API_KEY;
  if (cohereKey) {
    providers.push({
      name: "cohere",
      style: "cohere",
      url: "https://api.cohere.com/v2/chat",
      apiKey: cohereKey,
      // command-a-03-2025 is accurate but takes 20-30s on full round prompts.
      // command-r7b-12-2024 returns comparable JSON in ~11s.
      model: process.env.COHERE_MODEL || "command-r7b-12-2024",
      headers: {
        Authorization: `Bearer ${cohereKey}`,
        "Content-Type": "application/json",
        "User-Agent": APP_USER_AGENT,
        Accept: "application/json",
      },
      timeoutMs: numberFromEnv("COHERE_TIMEOUT_MS", 35_000),
      maxAttempts: 1,
      jsonMode: true,
    });
  }

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (nvidiaKey) {
    providers.push({
      name: "nvidia",
      style: "openai",
      url: "https://integrate.api.nvidia.com/v1/chat/completions",
      apiKey: nvidiaKey,
      // Most other NVIDIA models are 404 for this account, end-of-life, or
      // hang past 25s. This one answered in ~2.6s with clean JSON.
      model: process.env.NVIDIA_MODEL || "mistralai/mistral-large-4-1t-a52b",
      headers: {
        Authorization: `Bearer ${nvidiaKey}`,
        "Content-Type": "application/json",
        "User-Agent": APP_USER_AGENT,
        Accept: "application/json",
      },
      timeoutMs: numberFromEnv("LLM_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
      maxAttempts: 1,
      jsonMode: true,
    });
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    providers.push({
      name: "openrouter",
      style: "openai",
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openrouterKey,
      model: process.env.OPENROUTER_MODEL || "nvidia/nemotron-3.5-lightning:free",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "User-Agent": APP_USER_AGENT,
        Accept: "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://0xtrace.vercel.app",
        "X-Title": "0xTrace",
      },
      timeoutMs: numberFromEnv("LLM_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
      maxAttempts: 1,
      // This model spends ~300 tokens reasoning; 800 keeps the JSON intact.
      minTokens: 800,
      jsonMode: true,
    });
  }

  // Local, opt-in only. Set OLLAMA_BASE_URL or OLLAMA_MODEL to enable.
  const ollamaBase = process.env.OLLAMA_BASE_URL;
  const ollamaModel = process.env.OLLAMA_MODEL;
  if (ollamaBase || ollamaModel) {
    const base = (ollamaBase || "http://127.0.0.1:11434").replace(/\/$/, "");
    providers.push({
      name: "ollama",
      style: "openai",
      url: `${base}/v1/chat/completions`,
      apiKey: "ollama",
      model: ollamaModel || "qwen2.5:7b-instruct",
      headers: {
        Authorization: "Bearer ollama",
        "Content-Type": "application/json",
      },
      timeoutMs: numberFromEnv("OLLAMA_TIMEOUT_MS", 120_000),
      maxAttempts: 1,
      minTokens: 800,
      jsonMode: false,
    });
  }

  return providers;
}

export interface ProviderSummary {
  name: string;
  model: string;
  order: number;
}

/** Describe the configured chain without making a network call. */
export function getProviderSummary(): ProviderSummary[] {
  return getProviders().map((provider, index) => ({
    name: provider.name,
    model: provider.model,
    order: index + 1,
  }));
}

function buildBody(
  provider: ProviderConfig,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Record<string, unknown> {
  const tokens = Math.max(maxTokens, provider.minTokens ?? 0);
  const body: Record<string, unknown> = {
    model: provider.model,
    temperature: 0,
    max_tokens: tokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  if (provider.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  return body;
}

function extractContent(
  provider: ProviderConfig,
  payload: any
): { content: string; tokens?: number } {
  if (provider.style === "cohere") {
    const parts = payload?.message?.content;
    const content = Array.isArray(parts)
      ? parts.map((part: any) => part?.text || "").join("")
      : "";
    const usage = payload?.usage?.tokens;
    const tokens =
      typeof usage?.input_tokens === "number" || typeof usage?.output_tokens === "number"
        ? (usage.input_tokens || 0) + (usage.output_tokens || 0)
        : undefined;
    return { content, tokens };
  }

  const choice = payload?.choices?.[0];
  let content: string = choice?.message?.content || "";

  // Reasoning models sometimes leave content empty and put everything in
  // `reasoning`. Try to salvage JSON from there before giving up.
  if (!content.trim() && typeof choice?.message?.reasoning === "string") {
    content = choice.message.reasoning;
  }

  return { content, tokens: payload?.usage?.total_tokens };
}

/** Pull the first balanced JSON object out of arbitrary model output. */
function extractJsonObject(text: string): string | null {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
    .trim();

  // Markdown fence takes priority.
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() || cleaned;

  const first = candidate.indexOf("{");
  if (first === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = first; i < candidate.length; i++) {
    const char = candidate[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth++;
    if (char === "}") {
      depth--;
      if (depth === 0) return candidate.slice(first, i + 1);
    }
  }

  return null;
}

function parseJsonContent(content: string): unknown {
  const json = extractJsonObject(content);
  if (!json) throw new Error("response contained no JSON object");
  return JSON.parse(json);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callProviderOnce(
  provider: ProviderConfig,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  timeoutMs: number
): Promise<{ content: string; tokens?: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  let body = buildBody(provider, systemPrompt, userPrompt, maxTokens);

  try {
    let response = await fetch(provider.url, {
      method: "POST",
      headers: provider.headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    // Some OpenAI-compatible models reject response_format. Retry once
    // without it instead of dropping the whole provider.
    if (
      !response.ok &&
      (response.status === 400 || response.status === 422) &&
      "response_format" in body
    ) {
      const errorText = await response.text();
      if (/response_format|json_object|json mode/i.test(errorText)) {
        const withoutJson = { ...body };
        delete withoutJson.response_format;
        body = withoutJson;
        response = await fetch(provider.url, {
          method: "POST",
          headers: provider.headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } else {
        throw new ProviderHttpError(response.status, errorText, Date.now() - started);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new ProviderHttpError(response.status, errorText, Date.now() - started);
    }

    const payload = await response.json();
    const { content, tokens } = extractContent(provider, payload);
    const elapsed = Date.now() - started;

    console.log(
      `[LLM] provider=${provider.name} model=${provider.model} status=ok ms=${elapsed} tokens=${tokens ?? "?"}`
    );

    return { content, tokens };
  } catch (error: any) {
    const elapsed = Date.now() - started;
    if (error instanceof ProviderHttpError) throw error;
    if (error?.name === "AbortError") {
      throw new ProviderTimeoutError(timeoutMs, elapsed);
    }
    throw new ProviderNetworkError(error?.message || String(error), elapsed);
  } finally {
    clearTimeout(timer);
  }
}

class ProviderHttpError extends Error {
  constructor(
    public status: number,
    public body: string,
    public elapsedMs: number
  ) {
    super(`HTTP ${status}: ${body.slice(0, 240)}`);
    this.name = "ProviderHttpError";
  }
}

class ProviderTimeoutError extends Error {
  constructor(timeoutMs: number, elapsedMs: number) {
    super(`timeout after ${Math.round(elapsedMs / 1000)}s (limit ${Math.round(timeoutMs / 1000)}s)`);
    this.name = "ProviderTimeoutError";
  }
}

class ProviderNetworkError extends Error {
  constructor(message: string, public elapsedMs: number) {
    super(message);
    this.name = "ProviderNetworkError";
  }
}

function isRetryable(error: unknown): boolean {
  if (error instanceof ProviderHttpError) {
    return error.status === 429 || error.status >= 500;
  }
  return error instanceof ProviderNetworkError;
}

export interface LLMExtractOptions {
  /** Absolute timestamp (ms) after which no new provider attempt may start. */
  deadline?: number;
}

/**
 * Send a focused prompt through the provider chain and return parsed JSON.
 * Throws only when every configured provider fails.
 */
export async function llmExtract(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 1000,
  options: LLMExtractOptions = {}
): Promise<LLMCallResult> {
  const providers = getProviders();

  if (providers.length === 0) {
    throw new Error(
      "No LLM API keys configured. Set GROQ_API_KEY, COHERE_API_KEY, NVIDIA_API_KEY, or OPENROUTER_API_KEY."
    );
  }

  const failures: string[] = [];
  const budgetMs = numberFromEnv("LLM_CHAIN_BUDGET_MS", DEFAULT_CHAIN_BUDGET_MS);
  const deadline = Math.min(
    Date.now() + budgetMs,
    options.deadline ?? Number.POSITIVE_INFINITY
  );
  let budgetExhausted = false;

  for (const provider of providers) {
    if (budgetExhausted) break;

    for (let attempt = 1; attempt <= provider.maxAttempts; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 2_000) {
        failures.push(
          `chain budget exhausted after ${Math.round(budgetMs / 1000)}s (last provider: ${provider.name})`
        );
        budgetExhausted = true;
        break;
      }

      const timeoutMs = Math.min(provider.timeoutMs, remaining);

      try {
        const { content, tokens } = await callProviderOnce(
          provider,
          systemPrompt,
          userPrompt,
          maxTokens,
          timeoutMs
        );

        if (!content.trim()) {
          throw new Error("empty response content");
        }

        const data = parseJsonContent(content);

        return {
          data,
          provider: provider.name,
          model: provider.model,
          tokens_used: tokens,
        };
      } catch (error: any) {
        const message = error?.message || String(error);
        const retry = attempt < provider.maxAttempts && isRetryable(error);

        console.warn(
          `[LLM] provider=${provider.name} model=${provider.model} attempt=${attempt}/${provider.maxAttempts} status=fail error=${message.slice(0, 220)}`
        );

        if (retry) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }

        failures.push(`${provider.name}/${provider.model}: ${message.slice(0, 220)}`);
        break;
      }
    }
  }

  throw new Error(`All LLM providers failed:\n${failures.join("\n")}`);
}

/**
 * Convenience wrapper for prompts that expect a JSON object.
 */
export async function llmExtractJSON<T = any>(
  instruction: string,
  text: string,
  maxTokens: number = 800,
  options: LLMExtractOptions = {}
): Promise<LLMCallResult<T>> {
  const systemPrompt =
    "You are a precise data extraction engine. Extract the requested information and return ONLY a valid JSON object. No prose, no markdown commentary.";
  return llmExtract(
    systemPrompt,
    `${instruction}\n\nText:\n${text}`,
    maxTokens,
    options
  ) as Promise<LLMCallResult<T>>;
}

export type { ProviderConfig };
