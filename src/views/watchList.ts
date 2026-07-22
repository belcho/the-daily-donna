import { el, clear } from "../lib/dom";
import { isConfigured } from "../lib/supabase";
import {
  fetchSharedVideos,
  formatSharedDate,
  platformEmoji,
  platformLabel,
  youtubeEmbedUrl,
  type SharedVideo,
} from "../lib/sharedVideos";

function renderVideoCard(item: SharedVideo): HTMLElement {
  const card = el("div", { className: "card card-compact shared-video-card" });
  const header = el("div", { className: "shared-video-header" }, [
    el("span", {
      className: "shared-video-platform",
      text: `${platformEmoji(item.platform)} ${platformLabel(item.platform)}`,
    }),
    el("span", {
      className: "shared-video-date",
      text: formatSharedDate(item.created_at),
    }),
  ]);
  card.append(header);

  if (item.note?.trim()) {
    card.append(
      el("p", { className: "shared-video-note", text: item.note.trim() })
    );
  }

  const embed = youtubeEmbedUrl(item.url);
  if (embed) {
    const wrap = el("div", { className: "shared-video-embed-wrap" });
    const iframe = el("iframe", {
      className: "shared-video-embed",
      attrs: {
        src: embed,
        title: item.note?.trim() || "YouTube video",
        loading: "lazy",
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: "true",
      },
    });
    wrap.append(iframe);
    card.append(wrap);
  }

  card.append(
    el("a", {
      className: "btn btn-secondary btn-block",
      text: embed ? "Open in YouTube" : "Open link",
      attrs: {
        href: item.url,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    })
  );

  return card;
}

export async function renderWatchList(root: HTMLElement): Promise<void> {
  clear(root);

  if (!isConfigured()) {
    root.append(
      el("div", { className: "error-banner", text: "Site not configured." })
    );
    return;
  }

  root.append(el("div", { className: "loading", text: "Loading…" }));

  try {
    const items = await fetchSharedVideos();
    clear(root);

    root.append(
      el("header", { className: "app-header app-header-compact" }, [
        el("h1", { text: "Watch list" }),
        el("p", {
          className: "tagline",
          text: "YouTube, TikTok, and whatever else you saved",
        }),
      ])
    );

    if (items.length === 0) {
      root.append(
        el("div", { className: "card card-compact" }, [
          el("p", {
            text: "Nothing here yet. On the home page, paste a link under Videos & links.",
          }),
        ])
      );
    } else {
      const list = el("div", { className: "shared-video-list" });
      for (const item of items) {
        list.append(renderVideoCard(item));
      }
      root.append(list);
    }

    root.append(
      el("nav", { className: "app-footer-nav app-footer-compact" }, [
        el("a", { text: "Back to today", attrs: { href: "#/" } }),
        el("a", { text: "Good stuff", attrs: { href: "#/good-stuff" } }),
      ])
    );
  } catch (err) {
    clear(root);
    root.append(
      el("div", {
        className: "error-banner",
        text: err instanceof Error ? err.message : "Could not load watch list.",
      })
    );
  }
}
