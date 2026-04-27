import { MacroEstimate } from "@/lib/types";

type FoodDbRecord = {
  id: string;
  name: string;
  macrosPerServing: MacroEstimate;
  servingHint: string;
};

const MOCK_FOOD_DB: FoodDbRecord[] = [
  {
    id: "egg",
    name: "egg",
    servingHint: "1 large",
    macrosPerServing: { calories: 70, proteinGrams: 6, carbsGrams: 0.5, fatGrams: 5, fiberGrams: 0 }
  },
  {
    id: "toast",
    name: "toast",
    servingHint: "1 slice",
    macrosPerServing: { calories: 80, proteinGrams: 3, carbsGrams: 15, fatGrams: 1, fiberGrams: 2 }
  },
  {
    id: "butter",
    name: "butter",
    servingHint: "1 tsp",
    macrosPerServing: { calories: 34, proteinGrams: 0, carbsGrams: 0, fatGrams: 4, fiberGrams: 0 }
  },
  {
    id: "latte",
    name: "latte",
    servingHint: "12 oz",
    macrosPerServing: { calories: 180, proteinGrams: 9, carbsGrams: 18, fatGrams: 8, fiberGrams: 0 }
  },
  {
    id: "chicken_salad",
    name: "chicken salad",
    servingHint: "1 bowl",
    macrosPerServing: { calories: 320, proteinGrams: 28, carbsGrams: 12, fatGrams: 18, fiberGrams: 3 }
  },
  {
    id: "beer",
    name: "beer",
    servingHint: "12 oz",
    macrosPerServing: { calories: 150, proteinGrams: 2, carbsGrams: 13, fatGrams: 0, fiberGrams: 0 }
  }
];

export function searchFoodByName(query: string): FoodDbRecord[] {
  const normalized = query.trim().toLowerCase();
  return MOCK_FOOD_DB.filter((item) => item.name.includes(normalized) || normalized.includes(item.name));
}
