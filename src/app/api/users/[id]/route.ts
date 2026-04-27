import { NextResponse } from "next/server";

import { trackEvent } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  if (id !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  await trackEvent({
    eventName: "user_deleted",
    properties: { deletedUserId: id }
  });

  return new NextResponse(null, { status: 204 });
}
