import { el, clear } from "../lib/dom";
import { getCheckinDate, formatDisplayDate } from "../lib/checkinDate";
import { fetchCheckinByDate } from "../lib/checkins";
import { isConfigured } from "../lib/supabase";
import { renderSummary } from "../components/summary";

export async function renderHome(root: HTMLElement): Promise<void> {
  clear(root);

  if (!isConfigured()) {
    root.append(
      el("div", { className: "error-banner", text: "This site is not fully set up yet. Add Supabase settings to deploy." })
    );
    return;
  }

  root.append(el("div", { className: "loading", text: "Loading today…" }));

  try {
    const date = getCheckinDate();
    const row = await fetchCheckinByDate(date);
    clear(root);

    const header = el("header", { className: "app-header" }, [
      el("h1", { text: "The Daily Donna" }),
      el("p", {
        className: "tagline",
        text: formatDisplayDate(date),
      }),
    ]);
    root.append(header);

    if (!row || row.status === "draft") {
      const card = el("div", { className: "card" });
      card.append(
        el("h2", {
          text: row ? "Continue your check-in" : "Good morning, Donna",
        }),
        el("p", {
          text: row
            ? "You started today’s check-in. Pick up where you left off."
            : "A quick daily check-in — silly in spots, serious where it counts.",
        }),
        el("a", {
          className: "btn btn-primary btn-block",
          text: row ? "Continue check-in" : "Start today’s check-in",
          attrs: { href: "#/check-in" },
        })
      );
      root.append(card);
    } else {
      const card = el("div", { className: "card" });
      card.append(el("h2", { text: "Today’s check-in" }));
      card.append(renderSummary(row));
      card.append(
        el("p", {
          className: "step-hint",
          text: "You can update today’s answers until 5 AM tomorrow.",
        }),
        el("a", {
          className: "btn btn-secondary btn-block",
          text: "Update today’s answers",
          attrs: { href: "#/check-in" },
        })
      );
      root.append(card);
    }

    root.append(
      el("nav", { className: "app-footer-nav" }, [
        el("a", { text: "Past days", attrs: { href: "#/history" } }),
      ])
    );
  } catch (err) {
    clear(root);
    root.append(
      el("div", {
        className: "error-banner",
        text:
          err instanceof Error
            ? err.message
            : "Could not load today’s check-in.",
      }),
      el("a", {
        className: "btn btn-secondary",
        text: "Try again",
        attrs: { href: "#/" },
      })
    );
  }
}
