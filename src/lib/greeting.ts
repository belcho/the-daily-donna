const TZ = "America/New_York";

/** Greeting for Donna based on Eastern Time (matches check-in day logic). */
export function getDonnaGreeting(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "12", 10);

  if (hour >= 5 && hour < 12) return "Good morning, Donna";
  if (hour >= 12 && hour < 17) return "Good afternoon, Donna";
  if (hour >= 17 && hour < 22) return "Good evening, Donna";
  return "Hello, Donna";
}
