import type { CheckinRow } from "../types";
import { creatureLabel } from "../data/creatures";
import { moodLabel } from "../data/mood";
import { el } from "../lib/dom";

export function renderSummary(row: CheckinRow): HTMLElement {
  const wrap = el("div", { className: "summary-root" });

  const mood =
    row.mood != null
      ? `Feeling ${moodLabel(row.mood).toLowerCase()} today.`
      : "Mood not recorded.";

  let vitamins = "Vitamins: not answered.";
  if (row.vitamins_taken === false) {
    vitamins = "No vitamins today.";
  } else if (row.vitamins_taken === true) {
    if (row.vitamins_really === "yes_silly") {
      vitamins = "Yes — and yes, really all of them, silly.";
    } else if (row.vitamins_really === "not_all") {
      vitamins = "Took vitamins, but not all of them.";
    } else {
      vitamins = "Took vitamins.";
    }
  }

  let appts = "No appointments today — clear calendar!";
  if (row.appointments.length > 0) {
    const lines = row.appointments.map(
      (a) =>
        `${a.time.trim() || "Time TBD"} — ${a.description.trim() || "Appointment"}`
    );
    appts = lines.join("; ");
  }

  const pain =
    row.pain_level != null
      ? `Pain level: ${row.pain_level} out of 10.`
      : "Pain level not recorded.";

  let nature = "";
  if (row.saw_bunnies === true) {
    const n = row.bunny_count;
    nature =
      n != null && n > 0
        ? `Bunnies: yes — ${n} spotted!`
        : "Bunnies: yes!";
  } else if (row.saw_bunnies === false) {
    nature = "No bunnies spotted today.";
  }

  if (row.creatures.length > 0) {
    const names = row.creatures.map(creatureLabel).join(", ");
    nature += nature ? ` Other creatures: ${names}.` : `Creatures: ${names}.`;
  } else if (row.saw_bunnies != null) {
    nature += " No other creatures.";
  }

  const sections = [
    { label: "How you feel", value: mood },
    { label: "Vitamins", value: vitamins },
    { label: "Appointments", value: appts },
    { label: "Pain", value: pain },
    { label: "Nature watch", value: nature || "—" },
  ];

  if (row.note?.trim()) {
    sections.push({ label: "Note", value: row.note.trim() });
  }

  if (row.photo_url) {
    const photoWrap = el("div", { className: "summary-section" }, [
      el("div", { className: "summary-label", text: "Photo" }),
    ]);
    const img = el("img", {
      className: "checkin-photo",
      attrs: {
        src: row.photo_url,
        alt: "Creature or bunny photo from today",
        loading: "lazy",
      },
    });
    photoWrap.append(img);
    wrap.append(photoWrap);
  }

  for (const s of sections) {
    wrap.append(
      el("div", { className: "summary-section" }, [
        el("div", { className: "summary-label", text: s.label }),
        el("div", { className: "summary-value", text: s.value }),
      ])
    );
  }

  return wrap;
}
