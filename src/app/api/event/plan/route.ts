import { NextResponse } from "next/server";

import { analyzeMenuPlan } from "@/lib/event-planner";
import { trackEvent } from "@/lib/observability";
import { requireUserId } from "@/lib/require-user";
import { eventPlanInputSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await req.json();
  const parsed = eventPlanInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = { ...parsed.data, userId: auth.userId };
  const analysis = analyzeMenuPlan(input);

  await trackEvent({
    eventName: "event_plan_analyzed",
    userId: auth.userId,
    properties: {
      category: analysis.category,
      imageProvided: analysis.imageProvided
    }
  });

  return NextResponse.json({ analysis });
}
