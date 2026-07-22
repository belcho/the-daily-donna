export interface WeatherSnapshot {
  label: string;
  temperatureF: number;
  temperatureHighF?: number;
  temperatureLowF?: number;
  description: string;
  weatherCode: number;
}

export interface CityWeather {
  name: string;
  now: WeatherSnapshot;
  laterToday: WeatherSnapshot;
  tomorrow: WeatherSnapshot;
  bunnyNote: string;
}

/** WMO weather code → plain English (Open-Meteo). */
/** Emoji icon for current conditions (WMO code). */
export function weatherIconForCode(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  if (code <= 99) return "⛈️";
  return "🌤️";
}

export function weatherIconLabel(code: number): string {
  return describeWeather(code);
}

export function describeWeather(code: number): string {
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

function easternDateKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function formatSnapshotLine(s: WeatherSnapshot): string {
  if (s.temperatureHighF != null && s.temperatureLowF != null) {
    return `${s.temperatureLowF}–${s.temperatureHighF}°F · ${s.description}`;
  }
  return `${s.temperatureF}°F · ${s.description}`;
}

export function formatWeatherSnapshotLine(s: WeatherSnapshot): string {
  return formatSnapshotLine(s);
}

function pickLaterToday(
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  },
  todayKey: string
): WeatherSnapshot {
  const nowMs = Date.now();
  const entries: { ms: number; temp: number; code: number; hour: number }[] =
    [];

  for (let i = 0; i < hourly.time.length; i++) {
    const t = hourly.time[i];
    if (!t.startsWith(todayKey)) continue;
    const hour = parseInt(t.slice(11, 13), 10);
    entries.push({
      ms: new Date(t).getTime(),
      temp: hourly.temperature_2m[i],
      code: hourly.weather_code[i],
      hour,
    });
  }

  const future = entries.filter((e) => e.ms > nowMs);
  const preferred = future.find((e) => e.hour >= 17) ?? future[0];
  const pick = preferred ?? entries[entries.length - 1];

  if (!pick) {
    return {
      label: "Later today",
      temperatureF: 0,
      description: "—",
      weatherCode: 0,
    };
  }

  let label = "Later today";
  if (pick.hour >= 20) label = "This evening";
  else if (pick.hour >= 17) label = "Later today (~5 PM)";
  else if (future.length === 0) label = "Rest of today";

  return {
    label,
    temperatureF: Math.round(pick.temp),
    description: describeWeather(pick.code),
    weatherCode: pick.code,
  };
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
  url.searchParams.set(
    "current",
    "temperature_2m,weather_code"
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,weather_code"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min"
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", "America/New_York");
  url.searchParams.set("forecast_days", "2");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Weather unavailable");
  const data = (await res.json()) as {
    current: { temperature_2m: number; weather_code: number };
    hourly: {
      time: string[];
      temperature_2m: number[];
      weather_code: number[];
    };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };

  const todayKey = easternDateKey();
  const nowTemp = Math.round(data.current.temperature_2m);
  const nowCode = data.current.weather_code;

  const laterToday = pickLaterToday(data.hourly, todayKey);

  const tomorrowIdx = data.daily.time.findIndex((d) => d > todayKey);
  const tIdx = tomorrowIdx >= 0 ? tomorrowIdx : 1;
  const tomorrow: WeatherSnapshot = {
    label: "Tomorrow",
    temperatureF: Math.round(
      (data.daily.temperature_2m_max[tIdx] +
        data.daily.temperature_2m_min[tIdx]) /
        2
    ),
    temperatureHighF: Math.round(data.daily.temperature_2m_max[tIdx]),
    temperatureLowF: Math.round(data.daily.temperature_2m_min[tIdx]),
    description: describeWeather(data.daily.weather_code[tIdx]),
    weatherCode: data.daily.weather_code[tIdx],
  };

  return {
    name,
    now: {
      label: "Now",
      temperatureF: nowTemp,
      description: describeWeather(nowCode),
      weatherCode: nowCode,
    },
    laterToday,
    tomorrow,
    bunnyNote: bunnyNoteFor(nowCode, nowTemp),
  };
}

export async function fetchKentuckyWeather(): Promise<CityWeather[]> {
  return Promise.all(
    CITIES.map((c) => fetchCity(c.name, c.lat, c.lon))
  );
}
