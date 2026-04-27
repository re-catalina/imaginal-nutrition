/*
  Warnings:

  - You are about to drop the column `folder` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "folder",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isStaple" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prepMinutes" INTEGER,
ADD COLUMN     "prepNotes" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "RecipeFolder" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeFolderItem" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "RecipeFolderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdHocCart" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdHocCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdHocCartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "servings" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "AdHocCartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StapleRotation" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "rotationGroup" TEXT NOT NULL,
    "variants" JSONB NOT NULL,

    CONSTRAINT "StapleRotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipeFolder_householdId_idx" ON "RecipeFolder"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeFolderItem_folderId_recipeId_key" ON "RecipeFolderItem"("folderId", "recipeId");

-- CreateIndex
CREATE INDEX "AdHocCart_householdId_idx" ON "AdHocCart"("householdId");

-- CreateIndex
CREATE INDEX "AdHocCartItem_cartId_idx" ON "AdHocCartItem"("cartId");

-- CreateIndex
CREATE INDEX "AdHocCartItem_recipeId_idx" ON "AdHocCartItem"("recipeId");

-- CreateIndex
CREATE INDEX "StapleRotation_recipeId_idx" ON "StapleRotation"("recipeId");

-- CreateIndex
CREATE INDEX "Notification_userId_scheduledFor_idx" ON "Notification"("userId", "scheduledFor");

-- AddForeignKey
ALTER TABLE "RecipeFolder" ADD CONSTRAINT "RecipeFolder_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeFolderItem" ADD CONSTRAINT "RecipeFolderItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "RecipeFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeFolderItem" ADD CONSTRAINT "RecipeFolderItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdHocCart" ADD CONSTRAINT "AdHocCart_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdHocCartItem" ADD CONSTRAINT "AdHocCartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "AdHocCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdHocCartItem" ADD CONSTRAINT "AdHocCartItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StapleRotation" ADD CONSTRAINT "StapleRotation_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
