import type { CheckinRow } from "../types";
import { formatDisplayDate } from "./checkinDate";

export interface BunnyRecord {
  count: number;
  checkin_date: string;
}

export function computeBunnyRecord(
  rows: Pick<CheckinRow, "bunny_count" | "saw_bunnies" | "checkin_date">[]
): BunnyRecord | null {
  let best: BunnyRecord | null = null;
  for (const row of rows) {
    if (row.saw_bunnies !== true) continue;
    const count = row.bunny_count ?? 0;
    if (count <= 0) continue;
    if (!best || count > best.count) {
      best = { count, checkin_date: row.checkin_date };
    }
  }
  return best;
}

export function formatBunnyRecord(record: BunnyRecord): string {
  return `${record.count} on ${formatDisplayDate(record.checkin_date)}`;
}
