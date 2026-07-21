export const MOOD_LABELS = [
  "Rough",
  "Low",
  "So-so",
  "Good",
  "Great",
] as const;

export function moodLabel(level: number): string {
  return MOOD_LABELS[level - 1] ?? String(level);
}
