import { NextResponse } from "next/server";
import { parseFoodLog } from "@/lib/food-logging";
import { trackEvent } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { foodLogInputSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(req.url);
  const userId = auth.userId;
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const selectedDate = new Date(`${date}T00:00:00.000Z`);
  const nextDate = new Date(selectedDate);
  nextDate.setUTCDate(selectedDate.getUTCDate() + 1);

  const entries = await prisma.foodEntry.findMany({
    where: {
      userId,
      eatenAt: {
        gte: selectedDate,
        lt: nextDate
      }
    },
    include: { items: true },
    orderBy: { eatenAt: "asc" }
  });

  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await req.json();
  const parsedBody = foodLogInputSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.flatten() }, { status: 400 });
  }

  const userId = auth.userId;
  const { rawText, mealType, eatenAt } = parsedBody.data;
  const parsedFood = parseFoodLog(rawText);

  if (parsedFood.items.length === 0) {
    return NextResponse.json({ error: "Unable to parse foods from entry text." }, { status: 422 });
  }

  const entry = await prisma.foodEntry.create({
    data: {
      userId,
      rawText,
      mealType,
      eatenAt: eatenAt ? new Date(eatenAt) : new Date(),
      confidence: parsedFood.overallConfidence,
      items: {
        create: parsedFood.items.map((item) => ({
          sourceFoodId: item.sourceFoodId,
          foodName: item.foodName,
          quantity: item.quantity,
          calories: item.macros.calories,
          proteinGrams: item.macros.proteinGrams,
          carbsGrams: item.macros.carbsGrams,
          fatGrams: item.macros.fatGrams,
          fiberGrams: item.macros.fiberGrams,
          confidence: item.confidence
        }))
      }
    },
    include: { items: true }
  });

  await trackEvent({
    eventName: "food_logged",
    userId,
    properties: {
      confidence: parsedFood.overallConfidence,
      itemCount: parsedFood.items.length
    }
  });

  return NextResponse.json({
    entry,
    needsConfirmation: parsedFood.overallConfidence < 0.8
  });
}
