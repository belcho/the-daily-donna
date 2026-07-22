import { el } from "./dom";

/** Primary button that starts the check-in wizard (private code already unlocked). */
export function donnaCheckInButton(
  label: string,
  className: string
): HTMLAnchorElement {
  return el("a", {
    className,
    text: label,
    attrs: { href: "#/check-in", role: "button" },
  }) as HTMLAnchorElement;
}
