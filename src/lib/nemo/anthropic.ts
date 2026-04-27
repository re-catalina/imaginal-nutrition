import Anthropic from "@anthropic-ai/sdk";

export const NEMO_MODEL = "claude-sonnet-4-20250514";
export const NEMO_MAX_TOKENS = 1000;

export function getAnthropicClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return null;
  }
  return new Anthropic({ apiKey: key });
}
