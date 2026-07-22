import type { Appointment } from "../types";

const TZ = "America/New_York";

export function easternHour(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);
  return parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function isTomorrowAppointment(a: Appointment): boolean {
  return a.for_tomorrow === true;
}

export interface AppointmentHeadsUp {
  tone: "tonight" | "today";
  items: Appointment[];
}

function formatApptLine(a: Appointment): string {
  const when = a.time.trim() || "Time TBD";
  const what = a.description.trim() || "Appointment";
  return `${when} — ${what}`;
}

export function formatHeadsUpLines(items: Appointment[]): string[] {
  return items.map(formatApptLine);
}

/**
 * Evening: tomorrow's appts logged on today's check-in.
 * Morning/afternoon: today's appts logged yesterday with "tomorrow" flag.
 */
export function getAppointmentHeadsUp(
  _checkinDate: string,
  todayRow: { appointments: Appointment[] } | null,
  yesterdayRow: { appointments: Appointment[] } | null
): AppointmentHeadsUp | null {
  const evening = easternHour() >= 17;

  if (evening) {
    const items = (todayRow?.appointments ?? []).filter(isTomorrowAppointment);
    if (items.length > 0) return { tone: "tonight", items };
    return null;
  }

  const items = (yesterdayRow?.appointments ?? []).filter(isTomorrowAppointment);
  if (items.length > 0) return { tone: "today", items };
  return null;
}
