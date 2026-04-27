import { NextResponse } from "next/server";

import { buildNemoIntroMessage } from "@/lib/nemo/intro";
import { parseMessages, toJsonMessages, type StoredMessage } from "@/lib/nemo/stored-messages";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

function firstNameFromUser(name: string | null): string {
  if (!name?.trim()) {
    return "there";
  }
  return name.trim().split(/\s+/)[0] ?? "there";
}

export async function GET() {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { name: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const conv = await prisma.nemoConversation.findUnique({
    where: { userId: auth.userId }
  });

  let messages = parseMessages(conv?.messages ?? []);

  if (messages.length === 0) {
    const intro: StoredMessage = {
      role: "assistant",
      content: buildNemoIntroMessage(firstNameFromUser(user.name)),
      ts: new Date().toISOString()
    };
    messages = [intro];

    const saved = await prisma.nemoConversation.upsert({
      where: { userId: auth.userId },
      create: {
        userId: auth.userId,
        messages: toJsonMessages(messages)
      },
      update: {
        messages: toJsonMessages(messages)
      }
    });

    return NextResponse.json({
      conversationId: saved.id,
      messages
    });
  }

  return NextResponse.json({
    conversationId: conv!.id,
    messages
  });
}
