export function isInstalledPwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  const base = import.meta.env.BASE_URL;
  void navigator.serviceWorker.register(`${base}sw.js`).catch(() => {
    /* optional */
  });
}
