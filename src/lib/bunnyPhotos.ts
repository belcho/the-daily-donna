import type { CheckinRow } from "../types";

export interface BunnyPhotoEntry {
  checkin_date: string;
  photo_url: string;
}

export function collectBunnyPhotos(rows: CheckinRow[]): BunnyPhotoEntry[] {
  return rows
    .filter((r) => r.photo_url && r.photo_url.trim().length > 0)
    .map((r) => ({
      checkin_date: r.checkin_date,
      photo_url: r.photo_url!.trim(),
    }));
}

export function countBunnyPhotos(
  submittedHistory: CheckinRow[],
  todayRow: CheckinRow | null
): number {
  const dates = new Set(
    submittedHistory
      .filter((r) => r.photo_url?.trim())
      .map((r) => r.checkin_date)
  );
  if (
    todayRow?.photo_url?.trim() &&
    !dates.has(todayRow.checkin_date)
  ) {
    dates.add(todayRow.checkin_date);
  }
  return dates.size;
}
