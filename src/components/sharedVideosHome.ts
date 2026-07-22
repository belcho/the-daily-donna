import { el } from "../lib/dom";
import { addSharedVideo } from "../lib/sharedVideos";
import { gentleHaptic } from "../lib/haptics";

export function renderSharedVideosHomeCard(
  savedCount: number,
  onSaved: () => void
): HTMLElement {
  const card = el("div", { className: "card card-compact shared-videos-home" });
  const status = el("p", { className: "step-hint shared-videos-status", text: "" });

  const countLine =
    savedCount === 0
      ? "Paste a YouTube, TikTok, or any link you want to keep."
      : `${savedCount} saved — open your watch list anytime.`;

  card.append(
    el("h2", { text: "Videos & links" }),
    el("p", { className: "home-lead", text: countLine })
  );

  const urlInput = el("input", {
    className: "field-input",
    attrs: {
      type: "url",
      inputmode: "url",
      placeholder: "https://youtube.com/… or tiktok.com/…",
      autocomplete: "off",
    },
  }) as HTMLInputElement;

  const noteInput = el("input", {
    className: "field-input",
    attrs: {
      type: "text",
      placeholder: "Optional note (why you love it)",
      maxlength: "120",
    },
  }) as HTMLInputElement;

  const saveBtn = el("button", {
    className: "btn btn-secondary btn-block",
    text: "Save link",
    attrs: { type: "button" },
  });

  saveBtn.addEventListener("click", () => {
    const url = urlInput.value;
    if (!url.trim()) {
      status.textContent = "Paste a link first.";
      return;
    }
    saveBtn.setAttribute("disabled", "");
    status.textContent = "Saving…";
    void (async () => {
      try {
        await addSharedVideo(url, noteInput.value);
        gentleHaptic();
        urlInput.value = "";
        noteInput.value = "";
        status.textContent = "Saved — peek in your watch list.";
        onSaved();
      } catch (err) {
        status.textContent =
          err instanceof Error ? err.message : "Could not save that link.";
      } finally {
        saveBtn.removeAttribute("disabled");
      }
    })();
  });

  card.append(urlInput, noteInput, saveBtn, status);

  card.append(
    el("a", {
      className: "btn btn-ghost btn-block",
      text: "Open watch list",
      attrs: { href: "#/watch-list" },
    })
  );

  return card;
}
