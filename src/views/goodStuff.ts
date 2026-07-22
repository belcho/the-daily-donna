import { el, clear } from "../lib/dom";
import { isConfigured } from "../lib/supabase";
import {
  fetchGoodStuffPhotos,
  formatGoodStuffDate,
  pickRandomGoodStuff,
  type GoodStuffPhoto,
} from "../lib/goodStuff";

function wantsShuffle(): boolean {
  return (window.location.hash || "").includes("shuffle=1");
}

function openShuffleModal(photo: GoodStuffPhoto): void {
  const backdrop = el("div", {
    className: "weather-modal-backdrop good-stuff-shuffle-backdrop",
    attrs: { role: "presentation" },
  });
  const panel = el("div", {
    className: "weather-modal good-stuff-shuffle-modal",
    attrs: { role: "dialog", "aria-labelledby": "shuffle-title" },
  });

  const close = (): void => {
    backdrop.remove();
    document.body.classList.remove("weather-modal-open");
    if (window.location.hash.includes("shuffle=1")) {
      window.location.hash = "#/good-stuff";
    }
  };

  panel.append(
    el("div", { className: "weather-modal-header" }, [
      el("h2", { attrs: { id: "shuffle-title" }, text: "A little good stuff" }),
      el("button", {
        className: "weather-modal-close",
        text: "Close",
        attrs: { type: "button" },
        on: { click: close },
      }),
    ]),
    el("img", {
      className: "good-stuff-shuffle-img",
      attrs: {
        src: photo.photo_url,
        alt: photo.caption?.trim() || "Good stuff photo",
      },
    }),
    el("p", {
      className: "bunny-photo-date",
      text: formatGoodStuffDate(photo.created_at),
    })
  );

  if (photo.caption?.trim()) {
    panel.append(
      el("p", { className: "good-stuff-caption", text: photo.caption.trim() })
    );
  }

  const again = el("button", {
    className: "btn btn-secondary btn-block",
    text: "Another one",
    attrs: { type: "button" },
  });
  again.addEventListener("click", () => {
    void fetchGoodStuffPhotos().then((all) => {
      const next = pickRandomGoodStuff(all);
      if (!next) return;
      close();
      openShuffleModal(next);
    });
  });
  panel.append(again);

  backdrop.append(panel);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  document.body.classList.add("weather-modal-open");
  document.body.append(backdrop);
}

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

    if (photos.length > 0) {
      root.append(
        el("button", {
          className: "btn btn-secondary btn-block good-stuff-shuffle-btn",
          text: "Shuffle one",
          attrs: { type: "button" },
          on: {
            click: () => {
              const pick = pickRandomGoodStuff(photos);
              if (pick) openShuffleModal(pick);
            },
          },
        })
      );
    }

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
        const caption = photo.caption?.trim();
        item.append(
          el("img", {
            className: "bunny-photo-thumb",
            attrs: {
              src: photo.photo_url,
              alt: caption || `Good stuff from ${formatGoodStuffDate(photo.created_at)}`,
              loading: "lazy",
            },
          }),
          el("span", {
            className: "bunny-photo-date",
            text: caption || formatGoodStuffDate(photo.created_at),
          })
        );
        if (caption) {
          item.append(
            el("span", {
              className: "good-stuff-caption-thumb",
              text: formatGoodStuffDate(photo.created_at),
            })
          );
        }
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

    if (wantsShuffle() && photos.length > 0) {
      const pick = pickRandomGoodStuff(photos);
      if (pick) openShuffleModal(pick);
    }
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
