import { getCheckinDate } from "./checkinDate";

const TZ = "America/New_York";

/** Sunday that starts the grocery week (YYYY-MM-DD). */
export function getGroceryWeekKey(fromDate?: string): string {
  if (fromDate && /^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
    return sundayOnOrBefore(fromDate);
  }
  return sundayOnOrBefore(getCheckinDate());
}

function sundayOnOrBefore(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay();
  dt.setDate(dt.getDate() - day);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function formatGroceryWeekLabel(weekKey: string): string {
  const [y, m, d] = weekKey.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}
