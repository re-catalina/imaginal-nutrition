import { NextResponse } from "next/server";

import { fiberTargetFromCalories } from "@/lib/calorie-engine";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

function getStartOfUtcDay() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function GET() {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const userId = auth.userId;

  const profile = await prisma.healthProfile.findUnique({
    where: { userId }
  });

  if (
    !profile?.caloricTarget ||
    profile.proteinTarget == null ||
    profile.carbTarget == null ||
    profile.fatTarget == null
  ) {
    return NextResponse.json({ error: "No health profile targets found for user" }, { status: 404 });
  }

  const targetFiberGrams =
    profile.fiberTarget ?? fiberTargetFromCalories(profile.caloricTarget);

  const dayStart = getStartOfUtcDay();
  const tomorrowStart = new Date(dayStart);
  tomorrowStart.setUTCDate(dayStart.getUTCDate() + 1);

  const entries = await prisma.foodEntry.findMany({
    where: {
      userId,
      eatenAt: {
        gte: dayStart,
        lt: tomorrowStart
      }
    },
    include: { items: true }
  });

  const consumed = entries.reduce(
    (acc, entry) => {
      for (const item of entry.items) {
        acc.calories += item.calories;
        acc.protein += item.proteinGrams;
        acc.carbs += item.carbsGrams;
        acc.fat += item.fatGrams;
        acc.fiber += item.fiberGrams;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const round1 = (n: number) => Number(n.toFixed(1));

  return NextResponse.json({
    targetCalories: profile.caloricTarget,
    targetProteinGrams: profile.proteinTarget,
    targetCarbsGrams: profile.carbTarget,
    targetFatGrams: profile.fatTarget,
    targetFiberGrams,
    consumedCalories: consumed.calories,
    consumedProteinGrams: round1(consumed.protein),
    consumedCarbsGrams: round1(consumed.carbs),
    consumedFatGrams: round1(consumed.fat),
    consumedFiberGrams: round1(consumed.fiber),
    remainingCalories: profile.caloricTarget - consumed.calories,
    remainingProteinGrams: round1(profile.proteinTarget - consumed.protein),
    remainingCarbsGrams: round1(profile.carbTarget - consumed.carbs),
    remainingFatGrams: round1(profile.fatTarget - consumed.fat),
    remainingFiberGrams: round1(targetFiberGrams - consumed.fiber)
  });
}
