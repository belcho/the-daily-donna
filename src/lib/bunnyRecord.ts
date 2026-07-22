import type { CheckinRow } from "../types";
import { formatDisplayDate } from "./checkinDate";

export interface BunnyRecord {
  count: number;
  checkin_date: string;
}

type BunnyRow = Pick<CheckinRow, "bunny_count" | "saw_bunnies" | "checkin_date">;
type BunnyCountRow = Pick<CheckinRow, "bunny_count" | "saw_bunnies">;

/** Count for one day; legacy rows with yes but no number count as 1. */
export function effectiveBunnyCount(row: BunnyCountRow): number {
  if (row.saw_bunnies !== true) return 0;
  if (row.bunny_count != null && row.bunny_count > 0) {
    return row.bunny_count;
  }
  return 1;
}

export function computeBunnyRecord(rows: BunnyRow[]): BunnyRecord | null {
  let best: BunnyRecord | null = null;
  for (const row of rows) {
    const count = effectiveBunnyCount(row);
    if (count <= 0) continue;
    if (
      !best ||
      count > best.count ||
      (count === best.count && row.checkin_date > best.checkin_date)
    ) {
      best = { count, checkin_date: row.checkin_date };
    }
  }
  return best;
}

export function formatBunnyRecord(record: BunnyRecord): string {
  return `${record.count} on ${formatDisplayDate(record.checkin_date)}`;
}

export function formatTodayBunnies(count: number): string {
  return `${count} bunny${count === 1 ? "" : "ies"} today`;
}
