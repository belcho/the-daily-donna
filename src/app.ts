import { renderHome } from "./views/home";
import { renderCheckIn } from "./views/checkin";
import { renderHistory } from "./views/history";
import { renderDay } from "./views/day";
import { renderCreatureLog } from "./views/creatures";
import { renderReminders } from "./views/reminders";
import { renderFeedback } from "./views/feedback";
import { renderBunnyPhotos } from "./views/bunnyPhotos";
import { renderGoodStuffGallery } from "./views/goodStuff";
import { renderGrocery } from "./views/grocery";
import {
  renderDonnaSetup,
  renderDonnaUnlock,
} from "./views/donnaLock";
import { renderAdminGate, mountAdminBanner } from "./views/admin";
import { resolveDonnaLockState } from "./lib/donnaLock";
import { isAdminSession } from "./lib/adminLock";
import { isConfigured } from "./lib/supabase";
import { el } from "./lib/dom";

const appRoot = document.getElementById("app");

function parseRoute(): { name: string; param?: string } {
  const hash = window.location.hash || "#/";
  const path = hash.replace(/^#/, "").split("?")[0] || "/";

  if (path === "/" || path === "") return { name: "home" };
  if (path === "/admin") return { name: "admin" };
  if (path === "/check-in") return { name: "checkin" };
  if (path === "/history") return { name: "history" };
  if (path === "/creatures") return { name: "creatures" };
  if (path === "/reminders") return { name: "reminders" };
  if (path === "/feedback") return { name: "feedback" };
  if (path === "/bunny-photos") return { name: "bunnyPhotos" };
  if (path === "/good-stuff") return { name: "goodStuff" };
  if (path === "/grocery") return { name: "grocery" };
  const dayMatch = path.match(/^\/day\/(\d{4}-\d{2}-\d{2})$/);
  if (dayMatch) return { name: "day", param: dayMatch[1] };

  return { name: "home" };
}

async function route(): Promise<void> {
  if (!appRoot) return;

  const { name, param } = parseRoute();

  if (name === "admin") {
    const shell = el("div", { className: "app-shell app-shell-lock" });
    appRoot.replaceChildren(shell);
    await renderAdminGate(shell);
    return;
  }

  if (isConfigured()) {
    const lockState = await resolveDonnaLockState();
    if (lockState !== "ok") {
      const shell = el("div", { className: "app-shell app-shell-lock" });
      appRoot.replaceChildren(shell);
      const onDone = (): void => {
        void route();
      };
      if (lockState === "setup") {
        renderDonnaSetup(shell, onDone);
      } else {
        renderDonnaUnlock(shell, onDone);
      }
      return;
    }
  }

  const shell = el("div", { className: "app-shell" });
  appRoot.replaceChildren(shell);

  if (isAdminSession()) {
    mountAdminBanner(shell);
  }

  switch (name) {
    case "home":
      await renderHome(shell);
      break;
    case "checkin":
      await renderCheckIn(shell);
      break;
    case "history":
      await renderHistory(shell);
      break;
    case "creatures":
      await renderCreatureLog(shell);
      break;
    case "reminders":
      renderReminders(shell);
      break;
    case "feedback":
      await renderFeedback(shell);
      break;
    case "bunnyPhotos":
      await renderBunnyPhotos(shell);
      break;
    case "goodStuff":
      await renderGoodStuffGallery(shell);
      break;
    case "grocery":
      await renderGrocery(shell);
      break;
    case "day":
      if (param) await renderDay(shell, param);
      break;
  }
}

export function initApp(): void {
  window.addEventListener("hashchange", () => void route());
  void route();
}
