export type MealWantId =
  | "country"
  | "italian"
  | "pizza"
  | "mexican"
  | "chinese"
  | "burgers"
  | "soup_sandwich"
  | "seafood"
  | "breakfast"
  | "casserole"
  | "grill"
  | "southern"
  | "easy"
  | "treat";

export interface MealOption {
  id: MealWantId;
  label: string;
  hint?: string;
}

/** Pick one — country-friendly mix without a huge menu. */
export const MEAL_OPTIONS: MealOption[] = [
  { id: "country", label: "Country cooking", hint: "Meat, taters, the works" },
  { id: "southern", label: "Southern comfort", hint: "Fried chicken, biscuits…" },
  { id: "casserole", label: "Casserole night", hint: "Stick it in the oven" },
  { id: "grill", label: "Grill out", hint: "Burgers, dogs, outside" },
  { id: "italian", label: "Italian", hint: "Pasta, red sauce, garlic bread" },
  { id: "pizza", label: "Pizza night", hint: "Delivery or homemade" },
  { id: "mexican", label: "Mexican / Tex-Mex", hint: "Tacos, nachos, the good stuff" },
  { id: "chinese", label: "Chinese / takeout", hint: "Cartons & fortune cookies" },
  { id: "burgers", label: "Burgers & fries", hint: "Classic" },
  { id: "soup_sandwich", label: "Soup & sandwich", hint: "Cozy and simple" },
  { id: "seafood", label: "Seafood", hint: "Fish, shrimp, whatever" },
  { id: "breakfast", label: "Breakfast for dinner", hint: "Pancakes count" },
  { id: "easy", label: "Keep it easy", hint: "Leftovers or simple" },
  { id: "treat", label: "Treat yourself", hint: "Something fun or sweet" },
];

export function mealLabel(id: string | null | undefined): string {
  if (!id) return "";
  return MEAL_OPTIONS.find((m) => m.id === id)?.label ?? id;
}

export function mealHint(id: string | null | undefined): string {
  if (!id) return "";
  return MEAL_OPTIONS.find((m) => m.id === id)?.hint ?? "";
}
