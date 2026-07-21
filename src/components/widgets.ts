import { el } from "../lib/dom";

const FACE_PATHS = [
  "M12 38c-8 0-10-6-10-10 0-6 4-10 10-10s10 4 10 10c0 4-2 10-10 10z M8 22c1-2 3-2 4 0 M20 22c1-2 3-2 4 0 M12 30c-2 2-4 2-6 0",
  "M12 38c-7 0-9-5-9-9 0-5 3.5-9 9-9s9 4 9 9c0 4-2 9-9 9z M9 23c0-1 1-2 2-1 M19 23c0-1 1-2 2-1 M12 31c-1 1-2 1-3 0",
  "M12 38c-6 0-8-4-8-8 0-4 3-8 8-8s8 4 8 8c0 4-2 8-8 8z M9 24h2 M17 24h2 M10 30h8",
  "M12 38c-6 0-8-4-8-8 0-4 3-8 8-8s8 4 8 8c0 4-2 8-8 8z M9 23c1 1 2 1 3 0 M19 23c-1 1-2 1-3 0 M10 30c2 2 4 2 6 0",
  "M12 38c-6 0-8-4-8-8 0-4 3-8 8-8s8 4 8 8c0 4-2 8-8 8z M9 22c1 2 2 2 3 1 M19 22c-1 2-2 2-3 1 M9 30c3 3 6 3 9 0",
];

export function facePicker(
  labels: readonly string[],
  value: number | null,
  onChange: (v: number) => void
): HTMLElement {
  const row = el("div", {
    className: "face-picker",
    attrs: { role: "group", "aria-label": "How you feel today" },
  });

  labels.forEach((label, i) => {
    const level = i + 1;
    const btn = el("button", {
      className: "face-btn",
      attrs: {
        type: "button",
        "aria-pressed": value === level ? "true" : "false",
        "aria-label": label,
      },
      on: {
        click: () => onChange(level),
      },
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 44");
    svg.setAttribute("width", "48");
    svg.setAttribute("height", "72");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", FACE_PATHS[i] ?? FACE_PATHS[2]);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("stroke-linecap", "round");
    svg.append(path);

    btn.append(svg, el("span", { className: "face-label", text: label }));
    row.append(btn);
  });

  return row;
}

export function yesNoChoice(
  value: boolean | null,
  onChange: (v: boolean) => void,
  label: string
): HTMLElement {
  const group = el("div", {
    className: "choice-grid",
    attrs: { role: "group", "aria-label": label },
  });

  for (const [text, v] of [
    ["Yes", true],
    ["No", false],
  ] as const) {
    group.append(
      el("button", {
        className: "choice-btn",
        text,
        attrs: {
          type: "button",
          "aria-pressed": value === v ? "true" : "false",
        },
        on: { click: () => onChange(v) },
      })
    );
  }
  return group;
}

export function textChoice<T extends string>(
  options: { label: string; value: T }[],
  value: T | null,
  onChange: (v: T) => void,
  groupLabel: string
): HTMLElement {
  const group = el("div", {
    className: "choice-grid choice-grid-stack",
    attrs: { role: "group", "aria-label": groupLabel },
  });

  for (const opt of options) {
    group.append(
      el("button", {
        className: "choice-btn choice-btn-wide",
        text: opt.label,
        attrs: {
          type: "button",
          "aria-pressed": value === opt.value ? "true" : "false",
        },
        on: { click: () => onChange(opt.value) },
      })
    );
  }
  return group;
}
