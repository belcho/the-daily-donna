import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/components.css";
import { initApp } from "./app";
import { registerServiceWorker } from "./lib/pwa";
import { initTheme } from "./lib/theme";
import { refreshIfNewDeploy, watchForDeployUpdates } from "./lib/appUpdate";

async function boot(): Promise<void> {
  const reloaded = await refreshIfNewDeploy();
  if (reloaded) return;

  initTheme();
  registerServiceWorker();
  watchForDeployUpdates();
  initApp();
}

void boot();
