export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type GoalType = "fat_loss" | "maintenance" | "muscle_gain";

export type ProfileInput = {
  userId: string;
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  activityLevel: ActivityLevel;
  goalType: GoalType;
};

export type MacroEstimate = {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
};
