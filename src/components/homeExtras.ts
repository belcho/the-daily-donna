import { el } from "../lib/dom";
import { verseForCheckinDate } from "../data/verses";
import type { CityWeather } from "../lib/weather";
import { formatWeatherSnapshotLine } from "../lib/weather";
import type { CheckinRow } from "../types";
import {
  computeBunnyRecord,
  formatBunnyRecord,
  effectiveBunnyCount,
  formatTodayBunnies,
} from "../lib/bunnyRecord";

function bunnyTrackerLabel(
  history: Pick<CheckinRow, "bunny_count" | "saw_bunnies" | "checkin_date">[],
  todayRow: Pick<
    CheckinRow,
    "bunny_count" | "saw_bunnies" | "checkin_date" | "status"
  > | null
): string {
  const record = computeBunnyRecord(history);
  const todayCount =
    todayRow && todayRow.saw_bunnies === true
      ? effectiveBunnyCount(todayRow)
      : 0;

  if (todayCount > 0) {
    const best = record?.count ?? 0;
    if (todayCount > best) {
      return `${formatTodayBunnies(todayCount)} · New record!`;
    }
    if (record) {
      return `${formatTodayBunnies(todayCount)} · Record: ${formatBunnyRecord(record)}`;
    }
    return formatTodayBunnies(todayCount);
  }

  if (record) {
    return `Record: ${formatBunnyRecord(record)}`;
  }
  return "No bunny record yet";
}

export function renderGlanceBar(
  streak: number,
  history: Pick<CheckinRow, "bunny_count" | "saw_bunnies" | "checkin_date">[],
  todayRow: Pick<
    CheckinRow,
    "bunny_count" | "saw_bunnies" | "checkin_date" | "status"
  > | null
): HTMLElement {
  const bar = el("div", { className: "home-glance-bar" });

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
      el("span", { className: "glance-chip-label", text: "Bunny tracker" }),
      el("span", {
        className: "glance-chip-value",
        text: bunnyTrackerLabel(history, todayRow),
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
    const n = row ? effectiveBunnyCount(row) : 0;
    card.append(
      el("p", {
        className: "weather-bunny-yes",
        text: `You counted ${n} bunny${n === 1 ? "" : "ies"} today — nice!`,
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
