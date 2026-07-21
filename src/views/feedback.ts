import { el, clear } from "../lib/dom";
import { isConfigured } from "../lib/supabase";
import {
  createFeedbackItem,
  fetchFeedbackItems,
  updateFeedbackStatus,
  kindLabel,
  statusLabel,
  type FeedbackItem,
  type FeedbackKind,
  type FeedbackStatus,
} from "../lib/feedback";

const STATUSES: FeedbackStatus[] = ["open", "planned", "fixed", "wontfix"];

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

function renderItemList(
  items: FeedbackItem[],
  onRefresh: () => void
): HTMLElement {
  const wrap = el("div", { className: "feedback-list" });

  if (items.length === 0) {
    wrap.append(
      el("p", { className: "step-hint", text: "Nothing logged yet — add one above." })
    );
    return wrap;
  }

  const bugs = items.filter((i) => i.kind === "bug");
  const features = items.filter((i) => i.kind === "feature");

  for (const [heading, list] of [
    ["Bugs", bugs],
    ["Feature requests", features],
  ] as const) {
    if (list.length === 0) continue;
    wrap.append(el("h3", { className: "feedback-section-title", text: heading }));
    const ul = el("ul", { className: "feedback-items" });
    for (const item of list) {
      const li = el("li", { className: "feedback-item card" });
      li.append(
        el("div", { className: "feedback-item-header" }, [
          el("span", {
            className: `feedback-badge feedback-badge-${item.kind}`,
            text: kindLabel(item.kind),
          }),
          el("span", {
            className: `feedback-status feedback-status-${item.status}`,
            text: statusLabel(item.status),
          }),
        ]),
        el("div", { className: "feedback-item-title", text: item.title }),
        el("div", { className: "feedback-item-date", text: formatWhen(item.created_at) })
      );
      if (item.details.trim()) {
        li.append(el("p", { className: "feedback-item-details", text: item.details }));
      }

      const select = el("select", {
        className: "feedback-status-select",
        attrs: { "aria-label": `Status for ${item.title}` },
      }) as HTMLSelectElement;
      for (const s of STATUSES) {
        const opt = el("option", {
          text: statusLabel(s),
          attrs: { value: s },
        }) as HTMLOptionElement;
        if (s === item.status) opt.selected = true;
        select.append(opt);
      }
      select.addEventListener("change", () => {
        void (async () => {
          try {
            await updateFeedbackStatus(item.id, select.value as FeedbackStatus);
            onRefresh();
          } catch {
            select.value = item.status;
          }
        })();
      });
      li.append(
        el("label", { className: "field-label", text: "Status" }),
        select
      );
      ul.append(li);
    }
    wrap.append(ul);
  }

  return wrap;
}

export async function renderFeedback(root: HTMLElement): Promise<void> {
  clear(root);

  root.append(
    el("header", { className: "app-header" }, [
      el("h1", { text: "Bugs & ideas" }),
      el("p", {
        className: "tagline",
        text: "What’s broken or what should we build next?",
      }),
    ])
  );

  if (!isConfigured()) {
    root.append(
      el("div", { className: "error-banner", text: "Site not configured." })
    );
    return;
  }

  let kind: FeedbackKind = "bug";
  const message = el("p", { className: "save-hint", text: "" });

  async function loadList(host: HTMLElement): Promise<void> {
    host.append(el("div", { className: "loading", text: "Loading list…" }));
    try {
      const items = await fetchFeedbackItems();
      clear(host);
      host.append(renderItemList(items, () => void loadList(host)));
    } catch (err) {
      clear(host);
      host.append(
        el("div", {
          className: "error-banner",
          text: err instanceof Error ? err.message : "Could not load list.",
        })
      );
    }
  }

  const formCard = el("div", { className: "card" });
  formCard.append(el("h2", { text: "Add one" }));

  const kindGroup = el("div", {
    className: "choice-grid",
    attrs: { role: "group", "aria-label": "Type" },
  });
  for (const k of ["bug", "feature"] as const) {
    kindGroup.append(
      el("button", {
        className: "choice-btn",
        text: k === "bug" ? "Something’s broken" : "Feature idea",
        attrs: {
          type: "button",
          "aria-pressed": kind === k ? "true" : "false",
        },
        on: {
          click: () => {
            kind = k;
            [...kindGroup.querySelectorAll("button")].forEach((btn, i) => {
              btn.setAttribute(
                "aria-pressed",
                (["bug", "feature"][i] === k).toString()
              );
            });
          },
        },
      })
    );
  }

  const titleInput = el("input", {
    className: "feedback-title-input",
    attrs: {
      type: "text",
      placeholder: "Short title",
      maxlength: "120",
    },
  }) as HTMLInputElement;

  const detailsInput = el("textarea", {
    className: "note-input",
    attrs: {
      rows: "3",
      placeholder: "What happened or what would you like?",
    },
  }) as HTMLTextAreaElement;

  formCard.append(
    kindGroup,
    el("label", { className: "field-label", text: "Title" }),
    titleInput,
    el("label", { className: "field-label", text: "Details" }),
    detailsInput,
    el("button", {
      className: "btn btn-primary btn-block",
      text: "Save to the list",
      attrs: { type: "button" },
      on: {
        click: () => {
          const title = titleInput.value.trim();
          if (!title) {
            message.textContent = "Please add a title.";
            return;
          }
          message.textContent = "Saving…";
          void (async () => {
            try {
              await createFeedbackItem({
                kind,
                title,
                details: detailsInput.value,
              });
              titleInput.value = "";
              detailsInput.value = "";
              message.textContent = "Saved — thanks!";
              await loadList(listInner);
            } catch (err) {
              message.textContent =
                err instanceof Error ? err.message : "Could not save.";
            }
          })();
        },
      },
    }),
    message
  );

  root.append(formCard);

  const listHost = el("div", { className: "feedback-tracker" });
  listHost.append(
    el("h2", { className: "feedback-tracker-heading", text: "The list" })
  );
  const listInner = el("div");
  listHost.append(listInner);
  root.append(listHost);
  await loadList(listInner);

  root.append(
    el("nav", { className: "app-footer-nav" }, [
      el("a", { text: "Back to today", attrs: { href: "#/" } }),
    ])
  );
}
