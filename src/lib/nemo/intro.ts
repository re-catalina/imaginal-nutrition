/** Opening assistant copy for a new Nemo thread (matches product spec). */
export function buildNemoIntroMessage(firstName: string): string {
  const name = firstName.trim() || "there";
  return `Hi ${name}! I'm Nemo, your nutrition coach — powered by AI. I'm here to help with food, meals, and your fitness goals. Nothing else — just that. What's on your mind?`;
}
