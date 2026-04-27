import type { ActivityLevel } from "@/lib/types";

export const ACTIVITY_LEVEL_OPTIONS: {
  value: ActivityLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Little to no structured exercise; mostly sitting (e.g., desk job, driving most of the day)."
  },
  {
    value: "light",
    label: "Lightly active",
    description: "Light exercise or sports 1–3 days per week, or a job where you’re on your feet part of the day."
  },
  {
    value: "moderate",
    label: "Moderately active",
    description: "Moderate exercise or sports 3–5 days per week (e.g., brisk walks, gym sessions, recreational sports)."
  },
  {
    value: "active",
    label: "Very active",
    description: "Hard exercise or sports 6–7 days per week, or a physically demanding job plus regular workouts."
  },
  {
    value: "very_active",
    label: "Extremely active",
    description: "Athlete-level training, physical labor plus daily training, or multiple intense sessions most days."
  }
];
