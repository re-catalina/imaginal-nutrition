import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUserId } from "@/lib/require-user";

const bodySchema = z
  .object({
    label: z.string().max(120).optional(),
    itemCount: z.number().int().min(0).optional()
  })
  .strict();

/**
 * Stub for Instacart Developer Platform — returns success without calling external APIs.
 * Wire real cart creation here later; keep request shape stable for the client.
 */
export async function POST(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    stub: true,
    message: "Cart build skipped (Instacart API not configured).",
    userId: auth.userId,
    ...parsed.data
  });
}
