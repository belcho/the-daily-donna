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
import { donnaCheckInButton } from "../lib/donnaGate";
import { getDonnaGreeting } from "../lib/greeting";
import {
  renderVerseCard,
  renderWeatherCard,
  renderWeatherLoading,
  renderGlanceBar,
} from "../components/homeExtras";
import { fetchKentuckyWeather } from "../lib/weather";

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

    const shell = el("div", { className: "home-stack" });
    root.append(shell);

    const streak = computeStreak(history.map((h) => h.checkin_date));
    const greeting = getDonnaGreeting();

    shell.append(
      el("header", { className: "app-header app-header-compact" }, [
        el("h1", { text: "The Daily Donna" }),
        el("p", { className: "tagline", text: formatDisplayDate(date) }),
      ])
    );

    shell.append(renderGlanceBar(streak, history, row));

    shell.append(renderVerseCard(date));

    const weatherSlot = el("div");
    weatherSlot.append(renderWeatherLoading());
    shell.append(weatherSlot);
    void fetchKentuckyWeather()
      .then((cities) => {
        weatherSlot.replaceChildren(renderWeatherCard(cities, row));
      })
      .catch(() => {
        weatherSlot.replaceChildren(
          el("div", { className: "card card-compact" }, [
            el("h2", { text: "Weather bunny" }),
            el("p", {
              className: "step-hint",
              text: "Weather unavailable — try again later.",
            }),
          ])
        );
      });

    if (shouldShowReminderNudge(todaySubmitted)) {
      shell.append(
        el("div", { className: "nudge-banner nudge-banner-compact" }, [
          el("p", { text: "Today’s check-in is waiting whenever you’re ready." }),
          donnaCheckInButton("Check in", "btn btn-primary btn-block"),
        ])
      );
    }

    if (!row || row.status === "draft") {
      const card = el("div", { className: "card card-compact card-primary-action" });
      card.append(
        el("h2", { text: row ? "Continue your check-in" : greeting }),
        el("p", {
          className: "home-lead",
          text: row
            ? "Pick up where you left off."
            : "Quick daily check-in — silly in spots, serious where it counts.",
        }),
        donnaCheckInButton(
          row ? "Continue" : "Start check-in",
          "btn btn-primary btn-block"
        )
      );
      shell.append(card);
    } else {
      const card = el("div", { className: "card card-compact" });
      card.append(el("h2", { text: greeting }), renderSummary(row));
      card.append(
        donnaCheckInButton("Update today", "btn btn-secondary btn-block"),
      );
      shell.append(card);
    }

    if (!isInstalledPwa()) {
      shell.append(
        el("p", {
          className: "install-hint",
          text: "Tip: Share → Add to Home Screen for Donna’s purple app icon.",
        })
      );
    }

    shell.append(
      el("nav", { className: "app-footer-nav app-footer-compact" }, [
        el("a", { text: "Past days", attrs: { href: "#/history" } }),
        el("a", { text: "Creatures", attrs: { href: "#/creatures" } }),
        el("a", { text: "Reminder", attrs: { href: "#/reminders" } }),
        el("a", { text: "Bugs", attrs: { href: "#/feedback" } }),
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
