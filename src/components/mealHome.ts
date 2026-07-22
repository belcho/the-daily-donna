import { el } from "../lib/dom";
import { mealHint, mealLabel } from "../data/meals";
import type { CheckinRow } from "../types";

export function renderMealWantHomeCard(
  row: Pick<CheckinRow, "meal_want" | "status"> | null
): HTMLElement | null {
  const id = row?.meal_want;
  if (!id) return null;

  const label = mealLabel(id);
  const hint = mealHint(id);

  const card = el("div", { className: "card card-compact meal-want-card" });
  card.append(
    el("p", { className: "meal-want-kicker", text: "Donna’s food mood today" }),
    el("h2", { className: "meal-want-title", text: label })
  );
  if (hint) {
    card.append(el("p", { className: "meal-want-hint", text: hint }));
  }
  return card;
}
