const TZ = "America/New_York";

/** Logical check-in date (YYYY-MM-DD) — day starts at 5:00 AM Eastern. */
export function getCheckinDate(now: Date = new Date()): string {
  const params = new URLSearchParams(window.location.search);
  const debug = params.get("debugDate");
  if (debug && /^\d{4}-\d{2}-\d{2}$/.test(debug)) {
    return debug;
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "0";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = parseInt(get("hour"), 10);

  let y = parseInt(year, 10);
  let m = parseInt(month, 10);
  let d = parseInt(day, 10);

  if (hour < 5) {
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - 1);
    y = dt.getUTCFullYear();
    m = dt.getUTCMonth() + 1;
    d = dt.getUTCDate();
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
