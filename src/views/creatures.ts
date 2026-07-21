import { el, clear } from "../lib/dom";
import { fetchSubmittedHistory } from "../lib/checkins";
import { isConfigured } from "../lib/supabase";
import { creatureLabel } from "../data/creatures";
import { formatDisplayDate } from "../lib/checkinDate";

export async function renderCreatureLog(root: HTMLElement): Promise<void> {
  clear(root);

  root.append(
    el("header", { className: "app-header" }, [
      el("h1", { text: "Creature log" }),
      el("p", {
        className: "tagline",
        text: "Bunnies, groundhogs, Bigfoot, and friends",
      }),
    ])
  );

  if (!isConfigured()) {
    root.append(
      el("div", { className: "error-banner", text: "Site not configured." })
    );
    return;
  }

  root.append(el("div", { className: "loading", text: "Loading…" }));

  try {
    const rows = await fetchSubmittedHistory();
    clear(root);

    root.append(
      el("header", { className: "app-header" }, [
        el("h1", { text: "Creature log" }),
        el("p", {
          className: "tagline",
          text: "Bunnies, groundhogs, Bigfoot, and friends",
        }),
      ])
    );

    const sightings = rows.filter(
      (r) => r.saw_bunnies === true || r.creatures.length > 0
    );

    if (sightings.length === 0) {
      root.append(
        el("div", { className: "card" }, [
          el("p", {
            text: "No creature sightings yet. The bunnies are shy — check in again tomorrow!",
          }),
        ])
      );
    } else {
      const counts = new Map<string, number>();
    for (const row of sightings) {
      const ids = new Set<string>();
      if (row.saw_bunnies) ids.add("bunny");
      for (const id of row.creatures) ids.add(id);
      for (const id of ids) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }

    const stats = el("div", { className: "card" });
    stats.append(el("h2", { text: "Totals" }));
    const statList = el("ul", { className: "creature-stat-list" });
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    for (const [id, count] of sorted) {
      statList.append(
        el("li", {
          text: `${creatureLabel(id)}: ${count} day${count === 1 ? "" : "s"}`,
        })
      );
    }
      stats.append(statList);
      root.append(stats);

      const list = el("ul", { className: "history-list" });
      for (const row of sightings) {
        const parts: string[] = [];
        if (row.saw_bunnies) parts.push("Bunnies");
        for (const id of row.creatures) {
          if (id !== "bunny" || !row.saw_bunnies) {
            parts.push(creatureLabel(id));
          }
        }
        list.append(
          el("li", {}, [
            el("a", {
              className: "history-link",
              attrs: { href: `#/day/${row.checkin_date}` },
              html: `<strong>${formatDisplayDate(row.checkin_date)}</strong><br><span class="creature-day-detail">${parts.join(" · ")}</span>`,
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
        text: err instanceof Error ? err.message : "Could not load creature log.",
      })
    );
  }
}
