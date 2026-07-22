/** Short tap feedback on supported devices (often Android; iOS may ignore). */
export function gentleHaptic(): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }
  } catch {
    /* ignore */
  }
}
