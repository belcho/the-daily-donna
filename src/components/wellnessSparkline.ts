import type { CheckinRow } from "../types";
import { addDaysToIsoDate } from "../lib/appointmentHeadsUp";
import { el } from "../lib/dom";

const DAYS = 14;

interface DayPoint {
  date: string;
  mood: number | null;
  pain: number | null;
}

function buildSeries(checkinDate: string, history: CheckinRow[]): DayPoint[] {
  const byDate = new Map<string, CheckinRow>();
  for (const row of history) {
    if (row.status === "submitted") byDate.set(row.checkin_date, row);
  }

  const points: DayPoint[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = addDaysToIsoDate(checkinDate, -i);
    const row = byDate.get(date);
    points.push({
      date,
      mood: row?.mood ?? null,
      pain: row?.pain_level ?? null,
    });
  }
  return points;
}

function polyline(
  values: (number | null)[],
  min: number,
  max: number,
  width: number,
  height: number,
  padding: number
): string | null {
  const usable = values.filter((v): v is number => v != null);
  if (usable.length < 2) return null;

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const step = innerW / (values.length - 1);

  const coords: string[] = [];
  values.forEach((v, i) => {
    if (v == null) return;
    const x = padding + i * step;
    const t = (v - min) / (max - min);
    const y = padding + innerH * (1 - t);
    coords.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  });

  return coords.length >= 2 ? coords.join(" ") : null;
}

export function renderWellnessSparkline(
  checkinDate: string,
  history: CheckinRow[]
): HTMLElement | null {
  const series = buildSeries(checkinDate, history);
  const moodCount = series.filter((p) => p.mood != null).length;
  const painCount = series.filter((p) => p.pain != null).length;
  if (moodCount < 2 && painCount < 2) return null;

  const width = 280;
  const height = 72;
  const pad = 6;

  const moodLine = polyline(
    series.map((p) => p.mood),
    1,
    5,
    width,
    height,
    pad
  );
  const painLine = polyline(
    series.map((p) => p.pain),
    1,
    10,
    width,
    height,
    pad
  );

  const card = el("div", { className: "card card-compact sparkline-card" });
  card.append(
    el("h2", { text: "Your last two weeks" }),
    el("p", {
      className: "step-hint",
      text: "Mood (purple) and pain (rose). Only you see this.",
    })
  );

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", "sparkline-svg");
  svg.setAttribute("role", "img");
  svg.setAttribute(
    "aria-label",
    "Sparkline of mood and pain over the last fourteen days"
  );

  if (painLine) {
    const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    pl.setAttribute("points", painLine);
    pl.setAttribute("class", "sparkline-line sparkline-pain");
    pl.setAttribute("fill", "none");
    svg.append(pl);
  }
  if (moodLine) {
    const ml = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    ml.setAttribute("points", moodLine);
    ml.setAttribute("class", "sparkline-line sparkline-mood");
    ml.setAttribute("fill", "none");
    svg.append(ml);
  }

  card.append(svg);

  const legend = el("div", { className: "sparkline-legend" }, [
    el("span", { className: "sparkline-legend-mood", text: "Mood" }),
    el("span", { className: "sparkline-legend-pain", text: "Pain" }),
  ]);
  card.append(legend);

  return card;
}
