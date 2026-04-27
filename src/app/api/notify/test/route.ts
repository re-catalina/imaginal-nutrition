import { NextResponse } from "next/server";
import { z } from "zod";

import { logNotifyStub } from "@/lib/notify";
import { requireUserId } from "@/lib/require-user";

const schema = z
  .object({
    channel: z.enum(["sms", "whatsapp"]),
    to: z.string().min(8).max(32),
    body: z.string().min(1).max(280)
  })
  .strict();

/** Dev/test — routes “send” through the Twilio console stub. */
export async function POST(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  logNotifyStub({
    channel: parsed.data.channel,
    to: parsed.data.to,
    body: parsed.data.body,
    meta: { triggeredByUserId: auth.userId }
  });

  return NextResponse.json({ ok: true, stub: true });
}
