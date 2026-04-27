import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

const patchSchema = z
  .object({
    householdName: z.string().min(1).max(120).optional(),
    firstName: z.string().min(1).max(80).optional(),
    role: z.enum(["MEAL_PLANNER", "CONTRIBUTOR"]).optional(),
    nemoPersonality: z.string().min(1).max(64).optional(),
    notifyChannel: z.enum(["in_app", "sms", "whatsapp"]).optional(),
    weeklyPlanningDay: z.enum(["friday", "saturday", "sunday"]).optional(),
    checkInTime: z.string().max(8).optional(),
    fitnessGoal: z.string().max(200).optional(),
    groceryStoresNote: z.string().max(500).optional(),
    instagramNote: z.string().max(500).optional(),
    onboardingStep: z.number().int().min(0).max(20).optional(),
    onboardingComplete: z.boolean().optional()
  })
  .strict();

export async function GET() {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: { household: { include: { dependents: true, _count: { select: { recipes: true } } } } }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    image: user.image,
    household: user.household
      ? {
          id: user.household.id,
          name: user.household.name,
          recipeCount: user.household._count.recipes,
          dependents: user.household.dependents
        }
      : null,
    householdRole: user.householdRole,
    onboardingComplete: user.onboardingComplete,
    onboardingStep: user.onboardingStep,
    nemoPersonality: user.nemoPersonality,
    notifyChannel: user.notifyChannel,
    weeklyPlanningDay: user.weeklyPlanningDay,
    checkInTime: user.checkInTime,
    fitnessGoal: user.fitnessGoal,
    groceryStoresNote: user.groceryStoresNote,
    instagramNote: user.instagramNote
  });
}

export async function PATCH(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    const me = await tx.user.findUnique({
      where: { id: auth.userId },
      select: { householdId: true }
    });

    let newHouseholdId: string | null = null;

    if (body.householdName) {
      if (me?.householdId) {
        await tx.household.update({
          where: { id: me.householdId },
          data: { name: body.householdName }
        });
      } else {
        const created = await tx.household.create({
          data: { name: body.householdName },
          select: { id: true }
        });
        newHouseholdId = created.id;
      }
    }

    return tx.user.update({
      where: { id: auth.userId },
      data: {
        ...(newHouseholdId ? { householdId: newHouseholdId } : {}),
        ...(body.firstName !== undefined ? { name: body.firstName } : {}),
        ...(body.role !== undefined ? { householdRole: body.role } : {}),
        ...(body.nemoPersonality !== undefined ? { nemoPersonality: body.nemoPersonality } : {}),
        ...(body.notifyChannel !== undefined ? { notifyChannel: body.notifyChannel } : {}),
        ...(body.weeklyPlanningDay !== undefined ? { weeklyPlanningDay: body.weeklyPlanningDay } : {}),
        ...(body.checkInTime !== undefined ? { checkInTime: body.checkInTime } : {}),
        ...(body.fitnessGoal !== undefined ? { fitnessGoal: body.fitnessGoal } : {}),
        ...(body.groceryStoresNote !== undefined ? { groceryStoresNote: body.groceryStoresNote } : {}),
        ...(body.instagramNote !== undefined ? { instagramNote: body.instagramNote } : {}),
        ...(body.onboardingStep !== undefined ? { onboardingStep: body.onboardingStep } : {}),
        ...(body.onboardingComplete !== undefined ? { onboardingComplete: body.onboardingComplete } : {})
      },
      include: {
        household: true
      }
    });
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    household: updated.household,
    onboardingComplete: updated.onboardingComplete,
    onboardingStep: updated.onboardingStep
  });
}
