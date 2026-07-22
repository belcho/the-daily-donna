import { el, clear } from "../lib/dom";
import { fetchCheckinsWithPhotos } from "../lib/checkins";
import { isConfigured } from "../lib/supabase";
import { collectBunnyPhotos } from "../lib/bunnyPhotos";
import { formatDisplayDate } from "../lib/checkinDate";

export async function renderBunnyPhotos(root: HTMLElement): Promise<void> {
  clear(root);

  root.append(
    el("header", { className: "app-header app-header-compact" }, [
      el("h1", { text: "Bunny photos" }),
      el("p", {
        className: "tagline",
        text: "Every picture Donna has shared",
      }),
    ])
  );

  if (!isConfigured()) {
    root.append(
      el("div", { className: "error-banner", text: "Site not configured." })
    );
    return;
  }

  root.append(el("div", { className: "loading", text: "Loading photos…" }));

  try {
    const history = await fetchCheckinsWithPhotos();
    const photos = collectBunnyPhotos(history);
    clear(root);

    root.append(
      el("header", { className: "app-header app-header-compact" }, [
        el("h1", { text: "Bunny photos" }),
        el("p", {
          className: "tagline",
          text: `${photos.length} photo${photos.length === 1 ? "" : "s"} saved`,
        }),
      ])
    );

    if (photos.length === 0) {
      root.append(
        el("div", { className: "card card-compact" }, [
          el("p", {
            text: "No bunny photos yet. Add one during check-in on the “Got a photo?” step.",
          }),
        ])
      );
    } else {
      const grid = el("div", { className: "bunny-photo-grid" });
      for (const photo of photos) {
        const item = el("a", {
          className: "bunny-photo-item",
          attrs: {
            href: `#/day/${photo.checkin_date}`,
          },
        });
        item.append(
          el("img", {
            className: "bunny-photo-thumb",
            attrs: {
              src: photo.photo_url,
              alt: `Bunny photo from ${formatDisplayDate(photo.checkin_date)}`,
              loading: "lazy",
            },
          }),
          el("span", {
            className: "bunny-photo-date",
            text: formatDisplayDate(photo.checkin_date),
          })
        );
        grid.append(item);
      }
      root.append(grid);
    }

    root.append(
      el("nav", { className: "app-footer-nav app-footer-compact" }, [
        el("a", { text: "Back to today", attrs: { href: "#/" } }),
        el("a", { text: "Creature log", attrs: { href: "#/creatures" } }),
      ])
    );
  } catch (err) {
    clear(root);
    root.append(
      el("div", {
        className: "error-banner",
        text: err instanceof Error ? err.message : "Could not load photos.",
      })
    );
  }
}
