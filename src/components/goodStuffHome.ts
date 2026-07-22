import { el } from "../lib/dom";
import { addGoodStuffPhoto } from "../lib/goodStuff";
import { gentleHaptic } from "../lib/haptics";

export function renderGoodStuffHomeCard(
  savedCount: number,
  onUploaded: () => void
): HTMLElement {
  const card = el("div", { className: "card card-compact good-stuff-home" });
  const status = el("p", { className: "step-hint good-stuff-status", text: "" });

  const countLine =
    savedCount === 0
      ? "Nothing here yet — add something that made you smile."
      : `${savedCount} photo${savedCount === 1 ? "" : "s"} in your gallery.`;

  card.append(
    el("h2", { text: "Good stuff" }),
    el("p", { className: "home-lead", text: countLine })
  );

  const captionId = "good-stuff-caption";
  const captionInput = el("input", {
    className: "field-input",
    attrs: {
      id: captionId,
      type: "text",
      placeholder: "Optional caption (coffee, the dog, this sky…)",
      maxlength: "120",
    },
  }) as HTMLInputElement;

  const fileInput = el("input", {
    attrs: {
      type: "file",
      accept: "image/*",
    },
  }) as HTMLInputElement;
  fileInput.className = "good-stuff-file-input";

  const addBtn = el("button", {
    className: "btn btn-secondary btn-block",
    text: "Add a photo",
    attrs: { type: "button" },
  });

  let uploading = false;
  let pendingFile: File | null = null;

  function uploadPending(): void {
    if (!pendingFile || uploading) return;
    uploading = true;
    addBtn.setAttribute("disabled", "");
    status.textContent = "Uploading…";

    void (async () => {
      try {
        await addGoodStuffPhoto(pendingFile!, captionInput.value);
        gentleHaptic();
        pendingFile = null;
        captionInput.value = "";
        status.textContent = "Saved — tap View gallery to see it.";
        onUploaded();
      } catch {
        status.textContent = "Could not save — try again in a moment.";
      } finally {
        uploading = false;
        addBtn.removeAttribute("disabled");
        addBtn.textContent = "Add a photo";
      }
    })();
  }

  addBtn.addEventListener("click", () => {
    if (uploading) return;
    if (pendingFile) {
      uploadPending();
      return;
    }
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (!file) return;
    pendingFile = file;
    addBtn.textContent = "Save photo";
    status.textContent = "Add a caption if you like, then tap Save photo.";
  });

  card.append(captionInput, addBtn, fileInput, status);

  card.append(
    el("a", {
      className: "btn btn-ghost btn-block good-stuff-gallery-link",
      text: "View gallery",
      attrs: { href: "#/good-stuff" },
    })
  );

  if (savedCount > 0) {
    card.append(
      el("a", {
        className: "btn btn-ghost btn-block",
        text: "Shuffle one",
        attrs: { href: "#/good-stuff?shuffle=1" },
      })
    );
  }

  return card;
}
