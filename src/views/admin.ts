import { el, clear } from "../lib/dom";
import {
  saveAdminPin,
  unlockAdmin,
  endAdminSession,
  resolveAdminGateState,
} from "../lib/adminLock";
import { getCheckinDate } from "../lib/checkinDate";
import { fetchCheckinByDate, fetchSubmittedHistory } from "../lib/checkins";
import { isConfigured } from "../lib/supabase";

function codeInput(id: string, placeholder: string): HTMLInputElement {
  return el("input", {
    className: "field-input",
    attrs: {
      id,
      type: "password",
      autocomplete: "off",
      placeholder,
    },
  }) as HTMLInputElement;
}

function renderAdminSetup(root: HTMLElement, onDone: () => void): void {
  clear(root);
  const card = el("div", { className: "card donna-lock-card" });
  card.append(
    el("h1", { className: "donna-lock-title", text: "Family admin setup" }),
    el("p", {
      className: "donna-lock-lead",
      text: "This is only for you — not Donna’s code. Use it to preview the app without using her private login on your phone.",
    })
  );

  const a = "admin-setup-a";
  const b = "admin-setup-b";
  const status = el("p", { className: "step-hint", text: "" });

  card.append(
    el("label", { className: "field-label", attrs: { for: a }, text: "Admin code" }),
    codeInput(a, "Your admin code"),
    el("label", { className: "field-label", attrs: { for: b }, text: "Again" }),
    codeInput(b, "Same code"),
    status,
    el("button", {
      className: "btn btn-primary btn-block",
      text: "Save admin code",
      attrs: { type: "button" },
      on: {
        click: () => {
          void (async () => {
            const one = (document.getElementById(a) as HTMLInputElement).value;
            const two = (document.getElementById(b) as HTMLInputElement).value;
            if (!one.trim()) {
              status.textContent = "Pick a code.";
              return;
            }
            if (one !== two) {
              status.textContent = "Codes didn’t match.";
              return;
            }
            try {
              await saveAdminPin(one);
              const ok = await unlockAdmin(one);
              if (ok.ok) onDone();
            } catch (err) {
              status.textContent =
                err instanceof Error ? err.message : "Could not save.";
            }
          })();
        },
      },
    })
  );
  root.append(card);
}

function renderAdminLogin(root: HTMLElement, onDone: () => void): void {
  clear(root);
  const card = el("div", { className: "card donna-lock-card" });
  card.append(
    el("h1", { className: "donna-lock-title", text: "Family admin" }),
    el("p", {
      className: "donna-lock-lead",
      text: "Preview and check the app. Donna’s private code stays separate — this only lives on your browser session.",
    })
  );

  const id = "admin-login-code";
  const status = el("p", { className: "step-hint", text: "" });
  card.append(
    el("label", { className: "field-label", attrs: { for: id }, text: "Admin code" }),
    codeInput(id, "Admin code"),
    status,
    el("button", {
      className: "btn btn-primary btn-block",
      text: "Sign in",
      attrs: { type: "button" },
      on: {
        click: () => {
          void (async () => {
            const pin = (document.getElementById(id) as HTMLInputElement).value;
            const result = await unlockAdmin(pin);
            if (!result.ok) {
              status.textContent = result.message;
              return;
            }
            onDone();
          })();
        },
      },
    }),
    el("a", {
      className: "admin-back-link",
      text: "Back to Donna’s login",
      attrs: { href: "#/" },
    })
  );
  root.append(card);
}

async function renderAdminHub(root: HTMLElement): Promise<void> {
  clear(root);

  const header = el("header", { className: "app-header app-header-compact" }, [
    el("h1", { text: "Admin preview" }),
    el("p", {
      className: "tagline",
      text: "Browse like Donna — purple banner shows you’re in admin mode",
    }),
  ]);
  root.append(header);

  const card = el("div", { className: "card card-compact" });
  const status = el("p", { className: "step-hint", text: "Checking…" });
  card.append(el("h2", { text: "Quick health check" }), status);

  if (isConfigured()) {
    try {
      const date = getCheckinDate();
      const [today, history] = await Promise.all([
        fetchCheckinByDate(date),
        fetchSubmittedHistory(),
      ]);
      const lines = [
        `Check-in day (5 AM Eastern): ${date}`,
        `Today: ${today ? today.status : "no row yet"}`,
        `Submitted days on record: ${history.length}`,
      ];
      status.textContent = lines.join(" · ");
    } catch (err) {
      status.textContent =
        err instanceof Error ? err.message : "Could not reach Supabase.";
    }
  } else {
    status.textContent = "App env not configured in this build.";
  }
  root.append(card);

  const links = el("div", { className: "card card-compact" });
  links.append(el("h2", { text: "Open a screen" }));
  const pages: { label: string; href: string }[] = [
    { label: "Home (Donna’s today)", href: "#/" },
    { label: "Check-in wizard", href: "#/check-in" },
    { label: "Grocery list", href: "#/grocery" },
    { label: "Good stuff gallery", href: "#/good-stuff" },
    { label: "Bunny photos", href: "#/bunny-photos" },
    { label: "Past days", href: "#/history" },
    { label: "Bugs & encouragement jar", href: "#/feedback" },
    { label: "Reminders", href: "#/reminders" },
  ];
  for (const p of pages) {
    links.append(
      el("a", {
        className: "btn btn-secondary btn-block admin-nav-link",
        text: p.label,
        attrs: { href: p.href },
      })
    );
  }
  root.append(links);

  root.append(
    el("button", {
      className: "btn btn-ghost btn-block",
      text: "Sign out of admin",
      attrs: { type: "button" },
      on: {
        click: () => {
          endAdminSession();
          window.location.hash = "#/";
          window.location.reload();
        },
      },
    })
  );
}

export async function renderAdminGate(root: HTMLElement): Promise<void> {
  const state = await resolveAdminGateState();
  const onDone = (): void => {
    window.location.hash = "#/admin";
    void renderAdminGate(root);
  };

  if (state === "setup") {
    renderAdminSetup(root, onDone);
    return;
  }
  if (state === "login") {
    renderAdminLogin(root, onDone);
    return;
  }
  await renderAdminHub(root);
}

export function mountAdminBanner(shell: HTMLElement): void {
  const signOut = (): void => {
    endAdminSession();
    window.location.hash = "#/admin";
    window.location.reload();
  };

  const bar = el("div", { className: "admin-preview-banner" }, [
    el("span", { text: "Admin preview" }),
    el("a", { text: "Hub", attrs: { href: "#/admin" } }),
    el("button", {
      className: "admin-banner-btn",
      text: "Sign out",
      attrs: { type: "button" },
      on: { click: signOut },
    }),
  ]);
  shell.prepend(bar);
}
