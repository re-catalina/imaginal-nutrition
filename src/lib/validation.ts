import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80)
});

export const profileSchema = z.object({
  userId: z.string().min(1),
  weightLbs: z.number().positive().max(800),
  heightFeet: z.number().int().min(4).max(8),
  heightInches: z.number().int().min(0).max(11),
  age: z.number().int().min(18).max(100),
  sex: z.enum(["male", "female"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goalType: z.enum(["fat_loss", "maintenance", "muscle_gain"])
});

export const foodLogSchema = z.object({
  userId: z.string().min(1),
  rawText: z.string().min(3),
  mealType: z.string().optional(),
  eatenAt: z.string().datetime().optional()
});

/** Body for authenticated food logging — user resolved from session. */
export const foodLogInputSchema = foodLogSchema.omit({ userId: true });

export const eventPlanSchema = z.object({
  userId: z.string().min(1),
  restaurantName: z.string().min(2),
  plannedItemsText: z.string().min(3),
  plannedDrinks: z.string().optional(),
  menuImageUrl: z.string().url().optional(),
  remainingCalories: z.number().int().min(0)
});

export const eventPlanInputSchema = eventPlanSchema.omit({ userId: true });

export const coachQuerySchema = z.object({
  userId: z.string().min(1),
  question: z.string().min(3),
  remainingCalories: z.number().int().min(0),
  proteinConsumed: z.number().min(0)
});

export const coachQuestionSchema = coachQuerySchema.omit({ userId: true });

export const profileInputSchema = profileSchema.omit({ userId: true });
