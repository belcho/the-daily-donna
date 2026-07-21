import { el } from "./dom";

export const DONNA_CONFIRM_MESSAGE =
  "Are you Donna? If not you're in the wrong place.";

export function confirmIsDonna(): boolean {
  return window.confirm(DONNA_CONFIRM_MESSAGE);
}

/** Primary button that starts the check-in wizard after Donna confirms. */
export function donnaCheckInButton(
  label: string,
  className: string
): HTMLAnchorElement {
  return el("a", {
    className,
    text: label,
    attrs: { href: "#/check-in", role: "button" },
    on: {
      click: (e) => {
        e.preventDefault();
        if (confirmIsDonna()) {
          window.location.hash = "#/check-in";
        }
      },
    },
  }) as HTMLAnchorElement;
}
