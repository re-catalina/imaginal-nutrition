import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { buildCoachResponse } from "@/lib/coach";
import { trackEvent } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { coachQuestionSchema } from "@/lib/validation";

type StoredMessage = {
  role: string;
  content: string;
  ts: string;
};

function parseMessages(raw: Prisma.JsonValue): StoredMessage[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((item): item is StoredMessage => {
    if (!item || typeof item !== "object") {
      return false;
    }
    const r = item as Record<string, unknown>;
    return typeof r.role === "string" && typeof r.content === "string";
  });
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await req.json();
  const parsed = coachQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const response = buildCoachResponse(input);

  const existing = await prisma.nemoConversation.findUnique({
    where: { userId: auth.userId }
  });

  const history = parseMessages(existing?.messages ?? []);
  const ts = new Date().toISOString();
  history.push({ role: "user", content: input.question, ts });
  history.push({ role: "assistant", content: response, ts });

  const saved = await prisma.nemoConversation.upsert({
    where: { userId: auth.userId },
    create: {
      userId: auth.userId,
      messages: history as unknown as Prisma.InputJsonValue
    },
    update: {
      messages: history as unknown as Prisma.InputJsonValue
    }
  });

  await trackEvent({
    eventName: "coach_query_answered",
    userId: auth.userId,
    properties: {
      questionLength: input.question.length
    }
  });

  return NextResponse.json({ interactionId: saved.id, response });
}
