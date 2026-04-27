import { GoalType, ProfileInput } from "@/lib/types";

const ACTIVITY_MULTIPLIERS: Record<ProfileInput["activityLevel"], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

const GOAL_STRATEGY_PERCENT: Record<GoalType, number> = {
  fat_loss: -0.15,
  maintenance: 0,
  muscle_gain: 0.1
};

const PROTEIN_GRAMS_PER_LB: Record<GoalType, number> = {
  fat_loss: 0.85,
  maintenance: 0.7,
  muscle_gain: 0.95
};

export type CalorieTargetResult = {
  bmr: number;
  tdee: number;
  strategyPercent: number;
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetFiberGrams: number;
};

export function computeBmr(input: Pick<ProfileInput, "weightKg" | "heightCm" | "age" | "sex">): number {
  const sexOffset = input.sex === "male" ? 5 : -161;
  return 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + sexOffset;
}

export function computeCalorieTarget(input: ProfileInput): CalorieTargetResult {
  const bmr = computeBmr(input);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];
  const strategyPercent = GOAL_STRATEGY_PERCENT[input.goalType];
  const targetCalories = Math.round(tdee * (1 + strategyPercent));

  const weightLbs = input.weightKg / 0.45359237;
  let targetProteinGrams = Math.round(weightLbs * PROTEIN_GRAMS_PER_LB[input.goalType]);

  let targetFatGrams = Math.round((targetCalories * 0.28) / 9);
  let carbCalories = targetCalories - targetProteinGrams * 4 - targetFatGrams * 9;

  if (carbCalories < targetCalories * 0.2) {
    targetFatGrams = Math.round((targetCalories * 0.25) / 9);
    carbCalories = targetCalories - targetProteinGrams * 4 - targetFatGrams * 9;
  }

  if (carbCalories < 0) {
    targetProteinGrams = Math.max(80, Math.floor((targetCalories * 0.32) / 4));
    targetFatGrams = Math.round((targetCalories * 0.28) / 9);
    carbCalories = targetCalories - targetProteinGrams * 4 - targetFatGrams * 9;
  }

  const targetCarbsGrams = Math.max(45, Math.round(carbCalories / 4));

  const fiberFromEnergy = Math.round((targetCalories / 1000) * 14);
  const targetFiberGrams = Math.min(
    input.sex === "male" ? 38 : 25,
    Math.max(22, fiberFromEnergy)
  );

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    strategyPercent,
    targetCalories,
    targetProteinGrams,
    targetCarbsGrams,
    targetFatGrams,
    targetFiberGrams
  };
}

/** Fiber goal when only daily calorie target is stored (e.g. HealthProfile). */
export function fiberTargetFromCalories(targetCalories: number): number {
  const fiberFromEnergy = Math.round((targetCalories / 1000) * 14);
  return Math.min(38, Math.max(22, fiberFromEnergy));
}
