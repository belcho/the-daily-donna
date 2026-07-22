const STORAGE_KEY = "donna_last_build";

/** If GitHub Pages has a newer build, reload once (feels like a hard refresh for Donna). */
export async function refreshIfNewDeploy(): Promise<boolean> {
  const base = import.meta.env.BASE_URL;
  try {
    const res = await fetch(`${base}version.json`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { build?: string };
    const build = data.build?.trim();
    if (!build) return false;

    const prev = localStorage.getItem(STORAGE_KEY);
    if (prev && prev !== build) {
      localStorage.setItem(STORAGE_KEY, build);
      window.location.reload();
      return true;
    }
    if (!prev) localStorage.setItem(STORAGE_KEY, build);
    return false;
  } catch {
    return false;
  }
}

/** Re-check when she returns to the app (home screen or Safari tab). */
export function watchForDeployUpdates(): void {
  const run = (): void => {
    void refreshIfNewDeploy();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") run();
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) run();
  });
}
