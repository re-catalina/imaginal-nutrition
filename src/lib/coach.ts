type CoachQueryInput = {
  question: string;
  remainingCalories: number;
  proteinConsumed: number;
};

const OFF_TOPIC_SNIPPETS = ["code", "javascript", "python", "essay", "news", "stock", "crypto", "politic"];

export function isLikelyOffTopic(question: string): boolean {
  const normalized = question.toLowerCase();
  return OFF_TOPIC_SNIPPETS.some((word) => normalized.includes(word));
}

export function buildCoachResponse(input: CoachQueryInput): string {
  if (isLikelyOffTopic(input.question)) {
    return `I’m your nutrition coach — that’s where I can actually help you. What’s on your plate today?`;
  }

  const normalized = input.question.toLowerCase();
  if (normalized.includes("drink")) {
    return `You have about ${input.remainingCalories} calories left. Favor lower-calorie options (light beer, dry wine, or spirits with zero-calorie mixers) and cap drinks before appetite spikes.`;
  }
  if (normalized.includes("protein")) {
    return `You are at ${input.proteinConsumed}g protein so far. Prioritize lean proteins for your next meal to improve satiety while staying within your calorie budget.`;
  }
  return `You have ${input.remainingCalories} calories left today. Build your next meal around protein + high-volume vegetables and keep added fats measured for easier adherence.`;
}
