export interface CityWeather {
  name: string;
  temperatureF: number;
  description: string;
  bunnyNote: string;
}

/** WMO weather code → plain English (Open-Meteo). */
function describeWeather(code: number): string {
  if (code === 0) return "Clear skies";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorms";
  return "Mixed weather";
}

function bunnyNoteFor(code: number, tempF: number): string {
  if (code === 0 || code === 1) {
    return "Prime bunny-spotting weather — keep those eyes peeled!";
  }
  if (code <= 3) {
    return "Decent bunny weather. They might be nibbling in the shade.";
  }
  if (code <= 67 || code <= 82) {
    return "Bunnies may be tucked in dry — but you never know who’s under a bush.";
  }
  if (code <= 77 || code <= 86) {
    return "Cozy bunny day — they’re probably wearing their winter floof.";
  }
  if (tempF >= 85) {
    return "Hot out there — bunnies are likely siesta-ing.";
  }
  return "Weather bunny says: stay curious anyway.";
}

const CITIES = [
  { name: "Lexington, KY", lat: 38.0406, lon: -84.5037 },
  { name: "Harlan, KY", lat: 36.8431, lon: -83.3218 },
] as const;

async function fetchCity(
  name: string,
  lat: number,
  lon: number
): Promise<CityWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", "America/New_York");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Weather unavailable");
  const data = (await res.json()) as {
    current: { temperature_2m: number; weather_code: number };
  };
  const temp = Math.round(data.current.temperature_2m);
  const code = data.current.weather_code;
  const description = describeWeather(code);
  return {
    name,
    temperatureF: temp,
    description,
    bunnyNote: bunnyNoteFor(code, temp),
  };
}

export async function fetchKentuckyWeather(): Promise<CityWeather[]> {
  return Promise.all(
    CITIES.map((c) => fetchCity(c.name, c.lat, c.lon))
  );
}
