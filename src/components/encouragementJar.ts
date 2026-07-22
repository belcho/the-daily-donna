import { el } from "../lib/dom";
import type { EncouragementNote } from "../lib/encouragement";
import { pickEncouragementNote } from "../lib/encouragement";

export function renderEncouragementJarCard(
  notes: EncouragementNote[]
): HTMLElement | null {
  const note = pickEncouragementNote(notes);
  if (!note) return null;

  const card = el("div", { className: "card card-compact encouragement-card" });
  card.append(
    el("h2", { text: "Encouragement jar" }),
    el("p", { className: "encouragement-from", text: `From ${note.author_name}` }),
    el("blockquote", { className: "encouragement-message", text: note.message })
  );

  const refresh = el("button", {
    className: "btn btn-ghost encouragement-refresh",
    text: "Another one",
    attrs: { type: "button" },
  });

  refresh.addEventListener("click", () => {
    const next = pickEncouragementNote(notes);
    if (!next) return;
    const from = card.querySelector(".encouragement-from");
    const msg = card.querySelector(".encouragement-message");
    if (from) from.textContent = `From ${next.author_name}`;
    if (msg) msg.textContent = next.message;
  });

  card.append(refresh);
  return card;
}
