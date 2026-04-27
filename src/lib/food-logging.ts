import { searchFoodByName } from "@/lib/food-db";
import { MacroEstimate } from "@/lib/types";

export type ParsedFoodItem = {
  sourceFoodId: string;
  foodName: string;
  quantity: string;
  confidence: number;
  macros: MacroEstimate;
};

const SPLIT_REGEX = /,| and /gi;

function multiplyMacros(macros: MacroEstimate, multiplier: number): MacroEstimate {
  return {
    calories: Math.round(macros.calories * multiplier),
    proteinGrams: Number((macros.proteinGrams * multiplier).toFixed(1)),
    carbsGrams: Number((macros.carbsGrams * multiplier).toFixed(1)),
    fatGrams: Number((macros.fatGrams * multiplier).toFixed(1)),
    fiberGrams: Number((macros.fiberGrams * multiplier).toFixed(1))
  };
}

function parseQuantity(fragment: string): { multiplier: number; quantityLabel: string } {
  const match = fragment.trim().match(/^(\d+(\.\d+)?)/);
  if (!match) {
    return { multiplier: 1, quantityLabel: "1 serving" };
  }
  const multiplier = Number(match[1]);
  return {
    multiplier: Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1,
    quantityLabel: `${multiplier} serving(s)`
  };
}

export function parseFoodLog(rawText: string): { items: ParsedFoodItem[]; overallConfidence: number } {
  const fragments = rawText
    .toLowerCase()
    .split(SPLIT_REGEX)
    .map((fragment) => fragment.trim())
    .filter(Boolean);

  const items: ParsedFoodItem[] = fragments.flatMap((fragment) => {
    const { multiplier, quantityLabel } = parseQuantity(fragment);
    const searchTerm = fragment.replace(/^(\d+(\.\d+)?\s*)/, "").trim();
    const matches = searchFoodByName(searchTerm);

    if (matches.length === 0) {
      return [];
    }

    const top = matches[0];
    return [
      {
        sourceFoodId: top.id,
        foodName: top.name,
        quantity: quantityLabel,
        confidence: matches.length === 1 ? 0.92 : 0.72,
        macros: multiplyMacros(top.macrosPerServing, multiplier)
      }
    ];
  });

  const overallConfidence = items.length === 0 ? 0 : Number((items.reduce((sum, item) => sum + item.confidence, 0) / items.length).toFixed(2));
  return { items, overallConfidence };
}
