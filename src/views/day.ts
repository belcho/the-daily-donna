import { el, clear } from "../lib/dom";
import { formatDisplayDate } from "../lib/checkinDate";
import { fetchCheckinByDate } from "../lib/checkins";
import { isConfigured } from "../lib/supabase";
import { renderSummary } from "../components/summary";

export async function renderDay(
  root: HTMLElement,
  checkinDate: string
): Promise<void> {
  clear(root);

  if (!isConfigured()) {
    root.append(
      el("div", { className: "error-banner", text: "Site not configured." })
    );
    return;
  }

  root.append(el("div", { className: "loading", text: "Loading…" }));

  try {
    const row = await fetchCheckinByDate(checkinDate);
    clear(root);

    if (!row || row.status !== "submitted") {
      root.append(
        el("header", { className: "app-header" }, [
          el("h1", { text: "Not found" }),
        ]),
        el("div", { className: "card" }, [
          el("p", { text: "That day doesn’t have a completed check-in." }),
        ]),
        el("nav", { className: "app-footer-nav" }, [
          el("a", { text: "Past days", attrs: { href: "#/history" } }),
        ])
      );
      return;
    }

    root.append(
      el("header", { className: "app-header" }, [
        el("h1", { text: formatDisplayDate(checkinDate) }),
      ]),
      el("div", { className: "card" }, [renderSummary(row)]),
      el("nav", { className: "app-footer-nav" }, [
        el("a", { text: "Past days", attrs: { href: "#/history" } }),
        el("a", { text: "Today", attrs: { href: "#/" } }),
      ])
    );
  } catch (err) {
    clear(root);
    root.append(
      el("div", {
        className: "error-banner",
        text: err instanceof Error ? err.message : "Could not load day.",
      })
    );
  }
}
