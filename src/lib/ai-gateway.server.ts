/** Server-only helper for calling AI LLM endpoints. Never import from client code. */
const DEFAULT_GATEWAY_URL =
  process.env["AI_GATEWAY_URL"] || "https://openrouter.ai/api/v1/chat/completions";

export type ChatContent =
  { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ChatContent[];
}

export class GatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function callGateway(
  messages: ChatMessage[],
  options: { json?: boolean; model?: string } = {},
): Promise<string> {
  const key =
    process.env["AI_API_KEY"] ||
    process.env["OPENAI_API_KEY"] ||
    process.env["GEMINI_API_KEY"] ||
    process.env["LOVABLE_API_KEY"];

  if (!key) throw new GatewayError(500, "AI is not configured yet.");

  const gatewayUrl = process.env["AI_GATEWAY_URL"] || DEFAULT_GATEWAY_URL;
  const defaultModel = process.env["AI_MODEL"] || "google/gemini-2.5-flash";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: options.model ?? defaultModel,
      messages,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 429)
      throw new GatewayError(429, "Too many requests right now. Please try again in a minute.");
    if (response.status === 402)
      throw new GatewayError(402, "AI credits are finished. Please add credits to keep scanning.");
    throw new GatewayError(response.status, `AI request failed [${response.status}]: ${body}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Pulls a JSON object out of a model reply, even when it is wrapped in text or fences. */
export function parseJsonReply<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
