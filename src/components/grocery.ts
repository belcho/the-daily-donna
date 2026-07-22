import { el } from "../lib/dom";
import type { GroceryItem } from "../lib/grocery";
import {
  addGroceryItem,
  setGroceryItemGot,
  markAllGroceryGot,
} from "../lib/grocery";
import { gentleHaptic } from "../lib/haptics";

export function renderGroceryHomeTeaser(items: GroceryItem[]): HTMLElement {
  const left = items.filter((i) => !i.is_got).length;
  const card = el("div", { className: "card card-compact grocery-home-teaser" });

  card.append(
    el("h2", { text: "Grocery list" }),
    el("p", {
      className: "home-lead",
      text:
        items.length === 0
          ? "Add what you need for the week."
          : left === 0
            ? "Everything’s checked off — nice!"
            : `${left} item${left === 1 ? "" : "s"} still to grab.`,
    })
  );

  card.append(
    el("a", {
      className: "btn btn-secondary btn-block",
      text: "Open grocery list",
      attrs: { href: "#/grocery" },
    })
  );

  return card;
}

export function renderGroceryListPage(
  container: HTMLElement,
  items: GroceryItem[],
  reload: () => void
): void {
  container.replaceChildren();
  const input = el("input", {
    className: "field-input",
    attrs: {
      type: "text",
      placeholder: "Milk, bread, coffee…",
      maxlength: "80",
    },
  }) as HTMLInputElement;

  const status = el("p", { className: "step-hint", text: "" });

  const addRow = el("div", { className: "grocery-add-row" });
  const addBtn = el("button", {
    className: "btn btn-primary",
    text: "Add",
    attrs: { type: "button" },
  });

  function doAdd(): void {
    const name = input.value;
    if (!name.trim()) return;
    addBtn.setAttribute("disabled", "");
    void (async () => {
      try {
        await addGroceryItem(name);
        input.value = "";
        status.textContent = "";
        reload();
      } catch (err) {
        status.textContent =
          err instanceof Error ? err.message : "Could not add.";
      } finally {
        addBtn.removeAttribute("disabled");
      }
    })();
  }

  addBtn.addEventListener("click", doAdd);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doAdd();
    }
  });
  addRow.append(input, addBtn);

  const list = el("ul", { className: "grocery-list" });
  const pending = items.filter((i) => !i.is_got);
  const got = items.filter((i) => i.is_got);

  for (const item of pending) {
    list.append(groceryRow(item, reload));
  }
  if (got.length > 0 && pending.length > 0) {
    list.append(el("li", { className: "grocery-divider", text: "Got it" }));
  }
  for (const item of got) {
    list.append(groceryRow(item, reload));
  }

  if (items.length === 0) {
    list.append(
      el("li", {
        className: "grocery-empty",
        text: "List is empty — add your first item above.",
      })
    );
  }

  const actions = el("div", { className: "grocery-actions" });
  if (pending.length > 0) {
    actions.append(
      el("button", {
        className: "btn btn-secondary btn-block",
        text: "Got everything on the list",
        attrs: { type: "button" },
        on: {
          click: () => {
            void (async () => {
              try {
                await markAllGroceryGot();
                gentleHaptic();
                reload();
              } catch {
                status.textContent = "Could not update — try again.";
              }
            })();
          },
        },
      })
    );
  }

  container.append(addRow, status, list, actions);
}

function groceryRow(item: GroceryItem, reload: () => void): HTMLLIElement {
  const li = el("li", {
    className: `grocery-item${item.is_got ? " grocery-item-got" : ""}`,
  });
  const id = `grocery-${item.id}`;
  const label = el("label", {
    className: "grocery-item-label",
    attrs: { for: id },
  });
  const box = el("input", {
    attrs: { id, type: "checkbox" },
  }) as HTMLInputElement;
  box.checked = item.is_got;
  box.addEventListener("change", () => {
    void (async () => {
      try {
        await setGroceryItemGot(item.id, box.checked);
        if (box.checked) gentleHaptic();
        reload();
      } catch {
        box.checked = item.is_got;
      }
    })();
  });
  label.append(box, el("span", { text: item.name }));
  li.append(label);
  return li as HTMLLIElement;
}
