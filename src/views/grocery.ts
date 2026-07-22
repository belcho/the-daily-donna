import { el, clear } from "../lib/dom";
import { isConfigured } from "../lib/supabase";
import { fetchGroceryItems } from "../lib/grocery";
import { formatGroceryWeekLabel, getGroceryWeekKey } from "../lib/groceryWeek";
import { renderGroceryListPage } from "../components/grocery";

export async function renderGrocery(root: HTMLElement): Promise<void> {
  clear(root);

  if (!isConfigured()) {
    root.append(
      el("div", { className: "error-banner", text: "Site not configured." })
    );
    return;
  }

  const weekKey = getGroceryWeekKey();
  const weekLabel = formatGroceryWeekLabel(weekKey);

  root.append(
    el("header", { className: "app-header app-header-compact" }, [
      el("h1", { text: "Grocery list" }),
      el("p", { className: "tagline", text: `This week · ${weekLabel}` }),
    ])
  );

  const main = el("div", { className: "card card-compact grocery-main" });
  root.append(main);

  root.append(
    el("nav", { className: "app-footer-nav app-footer-compact" }, [
      el("a", { text: "Back to today", attrs: { href: "#/" } }),
    ])
  );

  async function reload(): Promise<void> {
    const items = await fetchGroceryItems(weekKey);
    renderGroceryListPage(main, items, () => void reload());
  }

  try {
    await reload();
  } catch (err) {
    main.append(
      el("div", {
        className: "error-banner",
        text: err instanceof Error ? err.message : "Could not load list.",
      })
    );
  }
}
