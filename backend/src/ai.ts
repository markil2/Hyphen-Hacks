import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config";

let client: Anthropic | null = null;

/**
 * One short Claude call. Returns null when no key is configured or the call fails,
 * so every caller has a non-AI fallback. Never logs prompts or replies: they
 * describe a family's care and health tracking.
 */
export async function askClaude(system: string, user: string, maxTokens = 1200): Promise<string | null> {
  if (!config.ANTHROPIC_API_KEY) return null;
  try {
    client ??= new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({ model: config.ANTHROPIC_MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] });
    return msg.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim() || null;
  } catch (e) {
    console.warn("AI call failed; using fallback", e instanceof Error ? e.name : "error");
    return null;
  }
}
