import { renderHome } from "./views/home";
import { renderCheckIn } from "./views/checkin";
import { renderHistory } from "./views/history";
import { renderDay } from "./views/day";
import { renderCreatureLog } from "./views/creatures";
import { renderReminders } from "./views/reminders";
import { renderFeedback } from "./views/feedback";
import { el } from "./lib/dom";

const appRoot = document.getElementById("app");

function parseRoute(): { name: string; param?: string } {
  const hash = window.location.hash || "#/";
  const path = hash.replace(/^#/, "") || "/";

  if (path === "/" || path === "") return { name: "home" };
  if (path === "/check-in") return { name: "checkin" };
  if (path === "/history") return { name: "history" };
  if (path === "/creatures") return { name: "creatures" };
  if (path === "/reminders") return { name: "reminders" };
  if (path === "/feedback") return { name: "feedback" };
  const dayMatch = path.match(/^\/day\/(\d{4}-\d{2}-\d{2})$/);
  if (dayMatch) return { name: "day", param: dayMatch[1] };

  return { name: "home" };
}

async function route(): Promise<void> {
  if (!appRoot) return;

  const shell = el("div", { className: "app-shell" });
  appRoot.replaceChildren(shell);

  const { name, param } = parseRoute();

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
    case "day":
      if (param) await renderDay(shell, param);
      break;
  }
}

export function initApp(): void {
  window.addEventListener("hashchange", () => void route());
  void route();
}
