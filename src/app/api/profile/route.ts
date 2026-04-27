import { NextResponse } from "next/server";

import { computeCalorieTarget } from "@/lib/calorie-engine";
import { feetInchesToCm, poundsToKg } from "@/lib/imperial";
import { trackEvent } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "@/lib/types";
import { profileInputSchema } from "@/lib/validation";
import { requireUserId } from "@/lib/require-user";

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await req.json();
  const parsed = profileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = { ...parsed.data, userId: auth.userId };
  const weightKg = poundsToKg(input.weightLbs);
  const heightCm = feetInchesToCm(input.heightFeet, input.heightInches);

  const profileForEngine: ProfileInput = {
    userId: input.userId,
    weightKg,
    heightCm,
    age: input.age,
    sex: input.sex,
    activityLevel: input.activityLevel,
    goalType: input.goalType
  };

  const target = computeCalorieTarget(profileForEngine);

  await prisma.$transaction([
    prisma.wellnessMetric.createMany({
      data: [
        {
          userId: input.userId,
          metricType: "weight_kg",
          value: weightKg,
          unit: "kg",
          isUserReported: true
        },
        {
          userId: input.userId,
          metricType: "height_cm",
          value: heightCm,
          unit: "cm",
          isUserReported: true
        },
        {
          userId: input.userId,
          metricType: "age_years",
          value: input.age,
          unit: "years",
          isUserReported: true
        }
      ]
    }),
    prisma.healthProfile.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        caloricTarget: target.targetCalories,
        proteinTarget: target.targetProteinGrams,
        carbTarget: target.targetCarbsGrams,
        fatTarget: target.targetFatGrams,
        fiberTarget: target.targetFiberGrams,
        fitnessGoal: input.goalType,
        activityLevel: input.activityLevel
      },
      update: {
        caloricTarget: target.targetCalories,
        proteinTarget: target.targetProteinGrams,
        carbTarget: target.targetCarbsGrams,
        fatTarget: target.targetFatGrams,
        fiberTarget: target.targetFiberGrams,
        fitnessGoal: input.goalType,
        activityLevel: input.activityLevel
      }
    })
  ]);

  await trackEvent({
    eventName: "profile_saved",
    userId: input.userId,
    properties: {
      goalType: input.goalType,
      activityLevel: input.activityLevel
    }
  });

  return NextResponse.json(target);
}
