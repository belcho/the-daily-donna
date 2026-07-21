const STORAGE_KEY = "donna_theme";

export type ThemeMode = "light" | "dark";

export function initTheme(): void {
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

export function getTheme(): ThemeMode {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export function setTheme(mode: ThemeMode): void {
  if (mode === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem(STORAGE_KEY, mode);
}

export function toggleTheme(): ThemeMode {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
