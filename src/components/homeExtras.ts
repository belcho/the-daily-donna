import { el } from "../lib/dom";
import { verseForCheckinDate } from "../data/verses";
import type { CityWeather } from "../lib/weather";

export function renderVerseCard(checkinDate: string): HTMLElement {
  const verse = verseForCheckinDate(checkinDate);
  return el("div", { className: "card verse-card" }, [
    el("h2", { text: "Today’s verse" }),
    el("blockquote", { className: "verse-text", text: `“${verse.text}”` }),
    el("cite", { className: "verse-ref", text: verse.reference }),
  ]);
}

export function renderWeatherCard(
  cities: CityWeather[],
  bunnyAnswer: boolean | null
): HTMLElement {
  const card = el("div", { className: "card weather-card" });
  card.append(el("h2", { text: "Weather bunny" }));

  if (bunnyAnswer === true) {
    card.append(
      el("p", {
        className: "weather-bunny-yes",
        text: "You said you saw bunnies today — the weather bunny is proud.",
      })
    );
  } else if (bunnyAnswer === false) {
    card.append(
      el("p", {
        className: "step-hint",
        text: "No bunnies yet? Here’s what it looks like out there:",
      })
    );
  } else {
    card.append(
      el("p", {
        className: "step-hint",
        text: "Today’s Kentucky weather — good to know for bunny patrol:",
      })
    );
  }

  for (const city of cities) {
    card.append(
      el("div", { className: "weather-city" }, [
        el("div", { className: "weather-city-name", text: city.name }),
        el("div", {
          className: "weather-city-temp",
          text: `${city.temperatureF}°F · ${city.description}`,
        }),
        el("p", { className: "weather-bunny-note", text: city.bunnyNote }),
      ])
    );
  }

  return card;
}

export function renderWeatherLoading(): HTMLElement {
  return el("div", { className: "card weather-card" }, [
    el("h2", { text: "Weather bunny" }),
    el("p", { className: "step-hint", text: "Checking Lexington & Harlan…" }),
  ]);
}
