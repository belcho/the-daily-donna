import { el, clear } from "../lib/dom";
import { isConfigured } from "../lib/supabase";
import {
  fetchGoodStuffPhotos,
  formatGoodStuffDate,
} from "../lib/goodStuff";

export async function renderGoodStuffGallery(
  root: HTMLElement
): Promise<void> {
  clear(root);

  if (!isConfigured()) {
    root.append(
      el("div", { className: "error-banner", text: "Site not configured." })
    );
    return;
  }

  root.append(el("div", { className: "loading", text: "Loading…" }));

  try {
    const photos = await fetchGoodStuffPhotos();
    clear(root);

    root.append(
      el("header", { className: "app-header app-header-compact" }, [
        el("h1", { text: "Good stuff" }),
        el("p", {
          className: "tagline",
          text: `${photos.length} little moment${photos.length === 1 ? "" : "s"}`,
        }),
      ])
    );

    if (photos.length === 0) {
      root.append(
        el("div", { className: "card card-compact" }, [
          el("p", {
            text: "No photos yet. From the home page, tap “Add a photo” under Good stuff.",
          }),
        ])
      );
    } else {
      const grid = el("div", { className: "bunny-photo-grid good-stuff-grid" });
      for (const photo of photos) {
        const item = el("div", { className: "bunny-photo-item good-stuff-item" });
        item.append(
          el("img", {
            className: "bunny-photo-thumb",
            attrs: {
              src: photo.photo_url,
              alt: `Good stuff from ${formatGoodStuffDate(photo.created_at)}`,
              loading: "lazy",
            },
          }),
          el("span", {
            className: "bunny-photo-date",
            text: formatGoodStuffDate(photo.created_at),
          })
        );
        grid.append(item);
      }
      root.append(grid);
    }

    root.append(
      el("nav", { className: "app-footer-nav app-footer-compact" }, [
        el("a", { text: "Back to today", attrs: { href: "#/" } }),
        el("a", { text: "Bunny photos", attrs: { href: "#/bunny-photos" } }),
      ])
    );
  } catch (err) {
    clear(root);
    root.append(
      el("div", {
        className: "error-banner",
        text: err instanceof Error ? err.message : "Could not load gallery.",
      })
    );
  }
}
