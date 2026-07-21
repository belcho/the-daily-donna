import { el, clear } from "../lib/dom";
import { formatDisplayDate } from "../lib/checkinDate";
import { fetchSubmittedHistory } from "../lib/checkins";
import { isConfigured } from "../lib/supabase";

export async function renderHistory(root: HTMLElement): Promise<void> {
  clear(root);

  root.append(
    el("header", { className: "app-header" }, [
      el("h1", { text: "Past days" }),
      el("p", { className: "tagline", text: "How Donna answered before" }),
    ])
  );

  if (!isConfigured()) {
    root.append(
      el("div", {
        className: "error-banner",
        text: "Site not configured.",
      })
    );
    return;
  }

  root.append(el("div", { className: "loading", text: "Loading history…" }));

  try {
    const rows = await fetchSubmittedHistory();
    clear(root);

    root.append(
      el("header", { className: "app-header" }, [
        el("h1", { text: "Past days" }),
        el("p", { className: "tagline", text: "How Donna answered before" }),
      ])
    );

    if (rows.length === 0) {
      root.append(
        el("div", { className: "card" }, [
          el("p", { text: "No completed check-ins yet." }),
        ])
      );
    } else {
      const list = el("ul", { className: "history-list" });
      for (const row of rows) {
        list.append(
          el("li", {}, [
            el("a", {
              className: "history-link",
              text: formatDisplayDate(row.checkin_date),
              attrs: { href: `#/day/${row.checkin_date}` },
            }),
          ])
        );
      }
      root.append(list);
    }

    root.append(
      el("nav", { className: "app-footer-nav" }, [
        el("a", { text: "Back to today", attrs: { href: "#/" } }),
      ])
    );
  } catch (err) {
    clear(root);
    root.append(
      el("div", {
        className: "error-banner",
        text: err instanceof Error ? err.message : "Could not load history.",
      }),
      el("a", {
        className: "btn btn-secondary",
        text: "Back to today",
        attrs: { href: "#/" },
      })
    );
  }
}
