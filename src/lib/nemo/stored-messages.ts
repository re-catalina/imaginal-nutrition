import type { Prisma } from "@prisma/client";

export type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  ts: string;
};

export function parseMessages(raw: Prisma.JsonValue | null | undefined): StoredMessage[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: StoredMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const r = item as Record<string, unknown>;
    const role = r.role;
    const content = r.content;
    if (role !== "user" && role !== "assistant") {
      continue;
    }
    if (typeof content !== "string") {
      continue;
    }
    out.push({
      role,
      content,
      ts: typeof r.ts === "string" ? r.ts : new Date().toISOString()
    });
  }
  return out;
}

export function toJsonMessages(messages: StoredMessage[]): Prisma.InputJsonValue {
  return messages as unknown as Prisma.InputJsonValue;
}
