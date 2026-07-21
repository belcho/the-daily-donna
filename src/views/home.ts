import { el, clear } from "../lib/dom";
import { getCheckinDate, formatDisplayDate } from "../lib/checkinDate";
import { fetchCheckinByDate, fetchSubmittedHistory } from "../lib/checkins";
import { isConfigured } from "../lib/supabase";
import { renderSummary } from "../components/summary";
import { computeStreak } from "../lib/streak";
import {
  maybeNotifyCheckIn,
  shouldShowReminderNudge,
} from "../lib/reminders";
import { isInstalledPwa } from "../lib/pwa";

export async function renderHome(root: HTMLElement): Promise<void> {
  clear(root);

  if (!isConfigured()) {
    root.append(
      el("div", {
        className: "error-banner",
        text: "This site is not fully set up yet. Add Supabase settings to deploy.",
      })
    );
    return;
  }

  root.append(el("div", { className: "loading", text: "Loading today…" }));

  try {
    const date = getCheckinDate();
    const [row, history] = await Promise.all([
      fetchCheckinByDate(date),
      fetchSubmittedHistory(),
    ]);
    const todaySubmitted = row?.status === "submitted";
    maybeNotifyCheckIn(date, todaySubmitted);

    clear(root);

    const streak = computeStreak(history.map((h) => h.checkin_date));

    const header = el("header", { className: "app-header" }, [
      el("h1", { text: "The Daily Donna" }),
      el("p", {
        className: "tagline",
        text: formatDisplayDate(date),
      }),
    ]);
    root.append(header);

    if (streak > 0) {
      root.append(
        el("div", { className: "streak-banner" }, [
          el("span", {
            className: "streak-text",
            text:
              streak === 1
                ? "1 day in a row — nice start!"
                : `${streak} days in a row — you’re on a roll!`,
          }),
        ])
      );
    }

    if (shouldShowReminderNudge(todaySubmitted)) {
      root.append(
        el("div", { className: "nudge-banner" }, [
          el("p", {
            text: "Whenever you’re ready — today’s check-in is waiting for you.",
          }),
          el("a", {
            className: "btn btn-primary btn-block",
            text: "Do today’s check-in",
            attrs: { href: "#/check-in" },
          }),
        ])
      );
    }

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

    if (!isInstalledPwa()) {
      root.append(
        el("div", { className: "card install-card" }, [
          el("h2", { text: "Add to Home Screen" }),
          el("p", {
            text: "Tap Share in Safari, then “Add to Home Screen” for a purple app icon on Donna’s phone.",
          }),
        ])
      );
    }

    root.append(
      el("nav", { className: "app-footer-nav" }, [
        el("a", { text: "Past days", attrs: { href: "#/history" } }),
        el("a", { text: "Creature log", attrs: { href: "#/creatures" } }),
        el("a", { text: "Reminder", attrs: { href: "#/reminders" } }),
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
