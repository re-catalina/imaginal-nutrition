import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAnthropicClient, NEMO_MAX_TOKENS, NEMO_MODEL } from "@/lib/nemo/anthropic";
import { getSystemPrompt } from "@/lib/nemo/systemPrompt";
import { parseMessages, toJsonMessages, type StoredMessage } from "@/lib/nemo/stored-messages";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

const bodySchema = z.object({
  message: z.string().min(1).max(20000),
  userId: z.string().min(1),
  conversationId: z.string().optional(),
  stream: z.boolean().optional()
});

function extractTextContent(msg: { content: unknown }): string {
  const blocks = msg.content as { type: string; text?: string }[];
  if (!Array.isArray(blocks)) {
    return "";
  }
  return blocks
    .filter((b): b is { type: "text"; text: string } => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("");
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { message, userId, conversationId, stream: streamPref } = parsed.data;
  if (userId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const anthropic = getAnthropicClient();
  if (!anthropic) {
    return NextResponse.json(
      { error: "Anthropic API is not configured (missing ANTHROPIC_API_KEY)." },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: { healthProfile: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const conv = await prisma.nemoConversation.findUnique({
    where: { userId: auth.userId }
  });

  if (conversationId && conv && conv.id !== conversationId) {
    return NextResponse.json({ error: "Conversation mismatch" }, { status: 403 });
  }

  const history = parseMessages(conv?.messages ?? []);
  const contextTail = history.slice(-20);
  const systemPrompt = getSystemPrompt(user, user.healthProfile);

  const apiMessages: MessageParam[] = contextTail.map((m) => ({
    role: m.role,
    content: m.content
  }));
  apiMessages.push({ role: "user", content: message });

  const wantStream = streamPref !== false;

  if (!wantStream) {
    try {
      const msg = await anthropic.messages.create({
        model: NEMO_MODEL,
        max_tokens: NEMO_MAX_TOKENS,
        system: systemPrompt,
        messages: apiMessages
      });
      const reply = extractTextContent(msg);
      const tsUser = new Date().toISOString();
      const tsAsst = new Date().toISOString();
      const updatedMessages: StoredMessage[] = [
        ...history,
        { role: "user", content: message, ts: tsUser },
        { role: "assistant", content: reply, ts: tsAsst }
      ];

      await prisma.nemoConversation.upsert({
        where: { userId: auth.userId },
        create: {
          userId: auth.userId,
          messages: toJsonMessages(updatedMessages)
        },
        update: {
          messages: toJsonMessages(updatedMessages)
        }
      });

      return NextResponse.json({ reply, updatedMessages });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Claude request failed";
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        const msgStream = anthropic.messages.stream({
          model: NEMO_MODEL,
          max_tokens: NEMO_MAX_TOKENS,
          system: systemPrompt,
          messages: apiMessages
        });

        msgStream.on("text", (delta) => {
          send({ delta });
        });

        const reply = await msgStream.finalText();

        const tsUser = new Date().toISOString();
        const tsAsst = new Date().toISOString();
        const updatedMessages: StoredMessage[] = [
          ...history,
          { role: "user", content: message, ts: tsUser },
          { role: "assistant", content: reply, ts: tsAsst }
        ];

        await prisma.nemoConversation.upsert({
          where: { userId: auth.userId },
          create: {
            userId: auth.userId,
            messages: toJsonMessages(updatedMessages)
          },
          update: {
            messages: toJsonMessages(updatedMessages)
          }
        });

        send({ done: true, reply, updatedMessages });
        controller.close();
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "Claude stream failed";
        send({ error: errMsg });
        controller.close();
      }
    }
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
