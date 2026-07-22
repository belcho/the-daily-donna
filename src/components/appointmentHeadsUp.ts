import type { AppointmentHeadsUp } from "../lib/appointmentHeadsUp";
import { formatHeadsUpLines } from "../lib/appointmentHeadsUp";
import { el } from "../lib/dom";

export function renderAppointmentHeadsUpCard(
  headsUp: AppointmentHeadsUp
): HTMLElement {
  const title =
    headsUp.tone === "tonight"
      ? "Heads up for tomorrow"
      : "Appointments today";
  const lead =
    headsUp.tone === "tonight"
      ? "You noted these for tomorrow — you've got this."
      : "From yesterday’s check-in — hope the day goes smoothly.";

  const card = el("div", { className: "card card-compact heads-up-card" });
  card.append(el("h2", { text: title }), el("p", { className: "home-lead", text: lead }));
  const ul = el("ul", { className: "heads-up-list" });
  for (const line of formatHeadsUpLines(headsUp.items)) {
    ul.append(el("li", { text: line }));
  }
  card.append(ul);
  return card;
}
