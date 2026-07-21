const STORAGE_KEY = "donna_reminder_settings";
const LAST_NUDGE_KEY = "donna_last_nudge_date";

export interface ReminderSettings {
  enabled: boolean;
  /** Local time HH:mm (24h) */
  time: string;
  notificationsEnabled: boolean;
}

const DEFAULT: ReminderSettings = {
  enabled: false,
  time: "09:00",
  notificationsEnabled: false,
};

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: Boolean(parsed.enabled),
      time: parsed.time && /^\d{2}:\d{2}$/.test(parsed.time) ? parsed.time : DEFAULT.time,
      notificationsEnabled: Boolean(parsed.notificationsEnabled),
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function minutesNowLocal(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function parseTimeMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** True when reminder is on, today not done, and local clock is past reminder time. */
export function shouldShowReminderNudge(todaySubmitted: boolean): boolean {
  if (todaySubmitted) return false;
  const s = getReminderSettings();
  if (!s.enabled) return false;
  return minutesNowLocal() >= parseTimeMinutes(s.time);
}

export function maybeNotifyCheckIn(checkinDate: string, todaySubmitted: boolean): void {
  const s = getReminderSettings();
  if (!s.enabled || !s.notificationsEnabled || todaySubmitted) return;
  if (!shouldShowReminderNudge(todaySubmitted)) return;
  if (localStorage.getItem(LAST_NUDGE_KEY) === checkinDate) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  localStorage.setItem(LAST_NUDGE_KEY, checkinDate);
  new Notification("The Daily Donna", {
    body: "Whenever you’re ready — today’s check-in is waiting for you.",
    tag: "donna-daily-reminder",
  });
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  return Notification.requestPermission();
}
