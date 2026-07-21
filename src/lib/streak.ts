import { getCheckinDate } from "./checkinDate";

/** Previous logical check-in date (calendar day before ISO date). */
export function previousCheckinDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/** Consecutive submitted days ending at the latest completed day (includes today if submitted). */
export function computeStreak(submittedDatesIso: string[]): number {
  const set = new Set(submittedDatesIso);
  if (set.size === 0) return 0;

  let cursor = getCheckinDate();
  if (!set.has(cursor)) {
    cursor = previousCheckinDate(cursor);
  }

  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = previousCheckinDate(cursor);
  }
  return streak;
}
