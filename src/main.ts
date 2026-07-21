import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/components.css";
import { initApp } from "./app";
import { registerServiceWorker } from "./lib/pwa";
import { initTheme } from "./lib/theme";

initTheme();
registerServiceWorker();
initApp();
