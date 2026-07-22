import { el } from "../lib/dom";
import { verseForCheckinDate } from "../data/verses";
import type { CityWeather } from "../lib/weather";
import { formatWeatherSnapshotLine } from "../lib/weather";
import type { CheckinRow } from "../types";
import {
  computeBunnyRecord,
  formatBunnyRecord,
} from "../lib/bunnyRecord";

export function renderGlanceBar(
  streak: number,
  history: Pick<CheckinRow, "bunny_count" | "saw_bunnies" | "checkin_date">[]
): HTMLElement {
  const bar = el("div", { className: "home-glance-bar" });
  const record = computeBunnyRecord(history);

  if (streak > 0) {
    bar.append(
      el("div", { className: "glance-chip" }, [
        el("span", { className: "glance-chip-label", text: "Streak" }),
        el("span", {
          className: "glance-chip-value",
          text: `${streak} day${streak === 1 ? "" : "s"}`,
        }),
      ])
    );
  }

  bar.append(
    el("div", { className: "glance-chip glance-chip-bunny" }, [
      el("span", { className: "glance-chip-label", text: "Bunny record" }),
      el("span", {
        className: "glance-chip-value",
        text: record ? formatBunnyRecord(record) : "—",
      }),
    ])
  );

  return bar;
}

export function renderVerseCard(checkinDate: string): HTMLElement {
  const verse = verseForCheckinDate(checkinDate);
  return el("div", { className: "card card-compact verse-card" }, [
    el("h2", { text: "Today’s verse" }),
    el("blockquote", { className: "verse-text", text: `“${verse.text}”` }),
    el("cite", { className: "verse-ref", text: verse.reference }),
  ]);
}

export function renderWeatherCard(
  cities: CityWeather[],
  row: Pick<CheckinRow, "saw_bunnies" | "bunny_count"> | null
): HTMLElement {
  const card = el("div", { className: "card card-compact weather-card" });
  card.append(el("h2", { text: "Weather bunny" }));

  const bunnyAnswer = row?.saw_bunnies ?? null;
  if (bunnyAnswer === true) {
    const n = row?.bunny_count;
    card.append(
      el("p", {
        className: "weather-bunny-yes",
        text:
          n != null && n > 0
            ? `You counted ${n} bunny${n === 1 ? "" : "ies"} today — nice!`
            : "You saw bunnies today — the weather bunny is proud.",
      })
    );
  } else if (bunnyAnswer === false) {
    card.append(
      el("p", {
        className: "step-hint weather-intro",
        text: "No bunnies yet? Kentucky weather:",
      })
    );
  } else {
    card.append(
      el("p", {
        className: "step-hint weather-intro",
        text: "Kentucky weather for bunny patrol:",
      })
    );
  }

  const grid = el("div", { className: "weather-cities-compact" });
  for (const city of cities) {
    grid.append(
      el("div", { className: "weather-city-compact" }, [
        el("div", { className: "weather-city-name", text: city.name }),
        el("div", {
          className: "weather-forecast-line",
          text: `Now: ${formatWeatherSnapshotLine(city.now)}`,
        }),
        el("div", {
          className: "weather-forecast-line",
          text: `${city.laterToday.label}: ${formatWeatherSnapshotLine(city.laterToday)}`,
        }),
        el("div", {
          className: "weather-forecast-line",
          text: `${city.tomorrow.label}: ${formatWeatherSnapshotLine(city.tomorrow)}`,
        }),
        el("p", { className: "weather-bunny-note", text: city.bunnyNote }),
      ])
    );
  }
  card.append(grid);
  return card;
}

export function renderWeatherLoading(): HTMLElement {
  return el("div", { className: "card card-compact weather-card" }, [
    el("h2", { text: "Weather bunny" }),
    el("p", { className: "step-hint", text: "Checking Lexington & Harlan…" }),
  ]);
}
