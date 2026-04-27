import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { householdId: true }
  });

  if (!user?.householdId) {
    return NextResponse.json({ error: "No household" }, { status: 404 });
  }

  const recipe = await prisma.recipe.findFirst({
    where: {
      id,
      householdId: user.householdId,
      deletedAt: null
    },
    include: {
      folderItems: {
        include: {
          folder: { select: { id: true, name: true, color: true } }
        }
      }
    }
  });

  if (!recipe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ recipe });
}
