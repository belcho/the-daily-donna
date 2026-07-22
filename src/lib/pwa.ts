export function isInstalledPwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  const base = import.meta.env.BASE_URL;

  void navigator.serviceWorker
    .register(`${base}sw.js`)
    .then((reg) => {
      void reg.update();

      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });

      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    })
    .catch(() => {
      /* optional */
    });
}
