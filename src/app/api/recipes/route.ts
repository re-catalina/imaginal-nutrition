import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  servings: z.coerce.number().int().min(1).max(20).default(4),
  /// Resolves to a `RecipeFolder` + `RecipeFolderItem` (replaces old string `folder` field).
  folderName: z.string().min(1).max(120).optional(),
  fromInstagram: z.boolean().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  prepMinutes: z.coerce.number().int().min(0).max(24 * 60).optional(),
  prepNotes: z.string().max(2000).optional(),
  tags: z.array(z.string().min(1).max(64)).max(32).optional(),
  isStaple: z.boolean().optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        amount: z.string().min(1)
      })
    )
    .min(1)
});

async function findOrCreateFolderId(householdId: string, name: string) {
  const existing = await prisma.recipeFolder.findFirst({
    where: { householdId, name }
  });
  if (existing) {
    return existing.id;
  }
  const created = await prisma.recipeFolder.create({
    data: { householdId, name }
  });
  return created.id;
}

export async function GET() {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { householdId: true }
  });

  if (!user?.householdId) {
    return NextResponse.json({ recipes: [] });
  }

  const recipes = await prisma.recipe.findMany({
    where: { householdId: user.householdId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      folderItems: {
        include: {
          folder: { select: { id: true, name: true, color: true } }
        }
      }
    }
  });

  return NextResponse.json({ recipes });
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) {
    return auth.response;
  }

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { householdId: true }
  });

  if (!user?.householdId) {
    return NextResponse.json({ error: "Create a household during onboarding first." }, { status: 400 });
  }

  const data = parsed.data;
  const tags = data.tags ?? [];
  const sourceUrl = data.sourceUrl?.trim() || undefined;
  const imageUrl = data.imageUrl?.trim() || undefined;

  const recipe = await prisma.recipe.create({
    data: {
      householdId: user.householdId,
      title: data.title,
      servings: data.servings,
      ingredientsJson: data.ingredients,
      fromInstagram: data.fromInstagram ?? false,
      sourceUrl,
      imageUrl,
      prepMinutes: data.prepMinutes ?? undefined,
      prepNotes: data.prepNotes?.trim() || undefined,
      tags,
      isStaple: data.isStaple ?? false
    }
  });

  let folderId: string | undefined;
  if (data.folderName?.trim()) {
    folderId = await findOrCreateFolderId(user.householdId, data.folderName.trim());
  } else if (data.fromInstagram) {
    folderId = await findOrCreateFolderId(user.householdId, "From Instagram");
  }

  if (folderId) {
    await prisma.recipeFolderItem.upsert({
      where: {
        folderId_recipeId: { folderId, recipeId: recipe.id }
      },
      create: { folderId, recipeId: recipe.id },
      update: {}
    });
  }

  const full = await prisma.recipe.findUnique({
    where: { id: recipe.id },
    include: {
      folderItems: {
        include: {
          folder: { select: { id: true, name: true, color: true } }
        }
      }
    }
  });

  return NextResponse.json({ recipe: full });
}
