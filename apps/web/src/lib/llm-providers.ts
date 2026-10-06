/**
 * Multi-provider LLM client with automatic fallback chain.
 * Groq → NVIDIA NIM → OpenRouter (free models only)
 */

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  tokens_used?: number;
}

interface ProviderConfig {
  name: string;
  url: string;
  apiKey: string;
  model: string;
  headers: Record<string, string>;
}

function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    providers.push({
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (nvidiaKey) {
    providers.push({
      name: "nvidia",
      url: "https://integrate.api.nvidia.com/v1/chat/completions",
      apiKey: nvidiaKey,
      model: "meta/llama-3.1-70b-instruct",
      headers: {
        Authorization: `Bearer ${nvidiaKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    providers.push({
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openrouterKey,
      model: "meta-llama/llama-3.3-70b-instruct:free",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://0xtrace.vercel.app",
        "X-Title": "0xTrace",
      },
    });
  }

  return providers;
}

/**
 * Send a focused prompt to the LLM with automatic fallback.
 * Returns parsed JSON from the LLM response.
 */
export async function llmExtract(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 1000
): Promise<{ data: any; provider: string; model: string }> {
  const providers = getProviders();

  if (providers.length === 0) {
    throw new Error("No LLM API keys configured. Set GROQ_API_KEY, NVIDIA_API_KEY, or OPENROUTER_API_KEY.");
  }

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const body: any = {
        model: provider.model,
        temperature: 0,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      };

      // Groq supports response_format
      if (provider.name === "groq") {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch(provider.url, {
        method: "POST",
        headers: provider.headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        const errMsg = `${provider.name} ${response.status}: ${errText.slice(0, 200)}`;
        console.warn(`[LLM] ${errMsg}`);
        errors.push(errMsg);
        continue; // Try next provider
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";

      // Parse JSON from response
      let parsed: any;
      try {
        // Find JSON object in response
        const first = content.indexOf("{");
        const last = content.lastIndexOf("}");
        if (first !== -1 && last !== -1) {
          parsed = JSON.parse(content.substring(first, last + 1));
        } else {
          parsed = JSON.parse(content);
        }
      } catch (parseErr) {
        console.warn(`[LLM] ${provider.name} returned unparseable JSON:`, content.slice(0, 200));
        errors.push(`${provider.name}: Invalid JSON response`);
        continue;
      }

      return {
        data: parsed,
        provider: provider.name,
        model: provider.model,
      };
    } catch (err: any) {
      const errMsg = `${provider.name}: ${err.message}`;
      console.warn(`[LLM] ${errMsg}`);
      errors.push(errMsg);
      continue;
    }
  }

  throw new Error(`All LLM providers failed:\n${errors.join("\n")}`);
}

/**
 * Convenience: extract with a simple prompt that expects a JSON object back.
 */
export async function llmExtractJSON<T = any>(
  instruction: string,
  text: string,
  maxTokens: number = 800
): Promise<{ data: T; provider: string }> {
  const systemPrompt = `You are a precise data extraction engine. Extract the requested information and return ONLY a valid JSON object. No markdown, no explanation, no extra text.`;
  const result = await llmExtract(systemPrompt, `${instruction}\n\nText:\n${text}`, maxTokens);
  return { data: result.data as T, provider: result.provider };
}
