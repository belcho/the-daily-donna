import { el, clear } from "../lib/dom";
import {
  saveDonnaPin,
  unlockWithPin,
  lockSession,
  setRememberedCode,
  getRememberedCode,
} from "../lib/donnaLock";

function privateCodeInput(id: string, placeholder: string): HTMLInputElement {
  return el("input", {
    className: "field-input private-code-input",
    attrs: {
      id,
      type: "text",
      autocomplete: "off",
      autocapitalize: "off",
      autocorrect: "off",
      spellcheck: "false",
      inputmode: "text",
      enterkeyhint: "go",
      placeholder,
    },
  }) as HTMLInputElement;
}

export function renderDonnaSetup(
  root: HTMLElement,
  onComplete: () => void
): void {
  clear(root);

  const card = el("div", { className: "card donna-lock-card" });
  card.append(
    el("h1", { className: "donna-lock-title", text: "Your private space" }),
    el("p", {
      className: "donna-lock-lead",
      text: "This is just for you, Donna. Everything you’ve already saved stays right here — we’re only adding a little code so it’s yours on this app.",
    }),
    el("p", {
      className: "step-hint",
      text: "Pick any code you’ll remember — letters, numbers, a pet name, whatever you like. No fancy rules.",
    })
  );

  const codeId = "donna-setup-code";
  const confirmId = "donna-setup-confirm";
  const rememberId = "donna-setup-remember";

  card.append(
    el("label", {
      className: "field-label",
      attrs: { for: codeId },
      text: "Your private code",
    }),
    privateCodeInput(codeId, "Something only you know"),
    el("label", {
      className: "field-label",
      attrs: { for: confirmId },
      text: "Type it again",
    }),
    privateCodeInput(confirmId, "Same code again"),
    (() => {
      const rememberInput = el("input", {
        attrs: { id: rememberId, type: "checkbox" },
      }) as HTMLInputElement;
      rememberInput.checked = true;
      return el("label", {
        className: "toggle-row",
        attrs: { for: rememberId },
      }, [
        rememberInput,
        el("span", { text: "Remember my code on this phone" }),
      ]);
    })()
  );

  const status = el("p", { className: "step-hint donna-lock-status", text: "" });
  const submit = el("button", {
    className: "btn btn-primary btn-block",
    text: "Save my code",
    attrs: { type: "button" },
  });

  submit.addEventListener("click", () => {
    void (async () => {
      status.textContent = "";
      const code = (document.getElementById(codeId) as HTMLInputElement).value;
      const again = (document.getElementById(confirmId) as HTMLInputElement)
        .value;
      const remember = (
        document.getElementById(rememberId) as HTMLInputElement
      ).checked;

      if (!code.trim()) {
        status.textContent = "Please choose a code.";
        return;
      }
      if (code !== again) {
        status.textContent = "Those two didn’t match — try again.";
        return;
      }

      submit.setAttribute("disabled", "true");
      try {
        await saveDonnaPin(code);
        const result = await unlockWithPin(code, remember);
        if (!result.ok) {
          status.textContent = result.message;
          submit.removeAttribute("disabled");
          return;
        }
        onComplete();
      } catch (err) {
        status.textContent =
          err instanceof Error
            ? err.message
            : "Could not save your code. Try again in a moment.";
        submit.removeAttribute("disabled");
      }
    })();
  });

  card.append(status, submit);
  root.append(card);
}

export function renderDonnaUnlock(
  root: HTMLElement,
  onComplete: () => void
): void {
  clear(root);

  const card = el("div", { className: "card donna-lock-card" });
  card.append(
    el("h1", { className: "donna-lock-title", text: "Welcome back, Donna" }),
    el("p", {
      className: "donna-lock-lead",
      text: "This is your check-in — only you see it when you enter your code. Your family link doesn’t open this without it on your phone.",
    })
  );

  const codeId = "donna-unlock-code";
  const rememberId = "donna-unlock-remember";
  const remembered = getRememberedCode();
  const hadRemembered = remembered !== null;

  const form = el("form", {
    className: "donna-lock-form",
    attrs: { action: "#" },
  }) as HTMLFormElement;

  const codeInput = privateCodeInput(codeId, "Your code");
  if (remembered) {
    codeInput.value = remembered;
  }

  form.append(
    el("label", {
      className: "field-label",
      attrs: { for: codeId },
      text: "Your private code",
    }),
    codeInput
  );

  const rememberInput = el("input", {
    attrs: {
      id: rememberId,
      type: "checkbox",
    },
  }) as HTMLInputElement;
  rememberInput.checked = hadRemembered;

  form.append(
    el("label", {
      className: "toggle-row",
      attrs: { for: rememberId },
    }, [rememberInput, el("span", { text: "Remember my code on this phone" })])
  );

  const status = el("p", { className: "step-hint donna-lock-status", text: "" });
  const submit = el("button", {
    className: "btn btn-primary btn-block",
    text: "Open my space",
    attrs: { type: "submit" },
  });

  async function tryUnlock(): Promise<void> {
    status.textContent = "";
    const code = codeInput.value;
    const remember = rememberInput.checked;

    if (!code.trim()) {
      status.textContent = "Enter your code to continue.";
      return;
    }

    submit.setAttribute("disabled", "");
    try {
      const result = await unlockWithPin(code, remember);
      if (!result.ok) {
        status.textContent = result.message;
        submit.removeAttribute("disabled");
        return;
      }
      onComplete();
    } catch (err) {
      status.textContent =
        err instanceof Error ? err.message : "Something went wrong.";
      submit.removeAttribute("disabled");
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void tryUnlock();
  });

  form.append(status, submit);

  if (hadRemembered) {
    form.append(
      el("p", {
        className: "step-hint donna-lock-remember-hint",
        text: "If the saved code isn’t working, clear it below and type the code again.",
      })
    );
  }

  const forgetBtn = el("button", {
    className: "btn btn-ghost btn-block donna-forget-code",
    text: "Clear saved code on this phone",
    attrs: { type: "button" },
  });
  forgetBtn.addEventListener("click", () => {
    setRememberedCode(null);
    codeInput.value = "";
    rememberInput.checked = false;
    status.textContent = "Saved code cleared. Type your code and tap Open my space.";
    codeInput.focus();
  });
  form.append(forgetBtn);

  card.append(form);
  card.append(
    el("p", { className: "admin-lock-foot" }, [
      el("a", {
        text: "Family admin preview",
        attrs: { href: "#/admin" },
      }),
    ])
  );
  root.append(card);

  codeInput.focus();
}

export function renderChangePrivateCodeSection(): HTMLElement {
  const card = el("div", { className: "card" });
  card.append(
    el("h2", { text: "Your private code" }),
    el("p", {
      className: "step-hint",
      text: "Only you use this to open your space. It’s saved as a secret scramble — not plain text in the cloud.",
    })
  );

  const currentId = "donna-change-current";
  const nextId = "donna-change-next";
  const againId = "donna-change-again";

  card.append(
    el("label", {
      className: "field-label",
      attrs: { for: currentId },
      text: "Current code",
    }),
    privateCodeInput(currentId, "Current code"),
    el("label", {
      className: "field-label",
      attrs: { for: nextId },
      text: "New code",
    }),
    privateCodeInput(nextId, "New code"),
    el("label", {
      className: "field-label",
      attrs: { for: againId },
      text: "New code again",
    }),
    privateCodeInput(againId, "Same new code")
  );

  const status = el("p", { className: "step-hint", text: "" });

  const saveBtn = el("button", {
    className: "btn btn-secondary btn-block",
    text: "Update my code",
    attrs: { type: "button" },
  });

  saveBtn.addEventListener("click", () => {
    void (async () => {
      status.textContent = "";
      const current = (document.getElementById(currentId) as HTMLInputElement)
        .value;
      const next = (document.getElementById(nextId) as HTMLInputElement).value;
      const again = (document.getElementById(againId) as HTMLInputElement).value;

      if (!current || !next) {
        status.textContent = "Fill in current and new codes.";
        return;
      }
      if (next !== again) {
        status.textContent = "New codes didn’t match.";
        return;
      }

      const check = await unlockWithPin(current, getRememberedCode() !== null);
      if (!check.ok) {
        status.textContent = "Current code isn’t right.";
        return;
      }

      try {
        await saveDonnaPin(next);
        if (getRememberedCode()) {
          setRememberedCode(next);
        }
        status.textContent = "Updated. Your new code is ready.";
      } catch {
        status.textContent = "Could not update — try again.";
      }
    })();
  });

  const lockBtn = el("button", {
    className: "btn btn-ghost btn-block",
    text: "Lock now (ask for code next time)",
    attrs: { type: "button" },
  });
  lockBtn.addEventListener("click", () => {
    lockSession();
    window.location.hash = "#/";
    window.location.reload();
  });

  const forgetBtn = el("button", {
    className: "btn btn-ghost btn-block",
    text: "Forget saved code on this phone",
    attrs: { type: "button" },
  });
  forgetBtn.addEventListener("click", () => {
    setRememberedCode(null);
    status.textContent = "Saved code removed from this device.";
  });

  card.append(status, saveBtn, lockBtn, forgetBtn);
  return card;
}
