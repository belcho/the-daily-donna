import { el, clear } from "../lib/dom";
import {
  getReminderSettings,
  saveReminderSettings,
  requestNotificationPermission,
} from "../lib/reminders";
import { isInstalledPwa } from "../lib/pwa";

export function renderReminders(root: HTMLElement): void {
  clear(root);
  let settings = getReminderSettings();

  const header = el("header", { className: "app-header" }, [
    el("h1", { text: "Gentle reminder" }),
    el("p", {
      className: "tagline",
      text: "Only on this device — no spam, promise",
    }),
  ]);
  root.append(header);

  const card = el("div", { className: "card" });
  const enabledId = "reminder-enabled";
  const timeId = "reminder-time";
  const notifyId = "reminder-notify";

  const enabledLabel = el("label", {
    className: "toggle-row",
    attrs: { for: enabledId },
  });
  const enabledInput = el("input", {
    attrs: {
      id: enabledId,
      type: "checkbox",
    },
  }) as HTMLInputElement;
  enabledInput.checked = settings.enabled;
  enabledLabel.append(enabledInput, el("span", { text: "Remind me if I haven’t checked in" }));

  const timeLabel = el("label", {
    attrs: { for: timeId },
    text: "Reminder time",
    className: "field-label",
  });
  const timeInput = el("input", {
    attrs: { id: timeId, type: "time", value: settings.time },
  }) as HTMLInputElement;

  const notifyLabel = el("label", {
    className: "toggle-row",
    attrs: { for: notifyId },
  });
  const notifyInput = el("input", {
    attrs: { id: notifyId, type: "checkbox" },
  }) as HTMLInputElement;
  notifyInput.checked = settings.notificationsEnabled;
  notifyLabel.append(
    notifyInput,
    el("span", { text: "Phone notification (if allowed)" })
  );

  const status = el("p", { className: "step-hint", text: "" });

  function syncDisabled(): void {
    const on = enabledInput.checked;
    timeInput.disabled = !on;
    notifyInput.disabled = !on;
  }

  function persist(): void {
    settings = {
      enabled: enabledInput.checked,
      time: timeInput.value || "09:00",
      notificationsEnabled: notifyInput.checked,
    };
    saveReminderSettings(settings);
    status.textContent = "Saved.";
  }

  enabledInput.addEventListener("change", () => {
    syncDisabled();
    persist();
  });
  timeInput.addEventListener("change", persist);
  notifyInput.addEventListener("change", () => {
    void (async () => {
      if (notifyInput.checked) {
        const perm = await requestNotificationPermission();
        if (perm !== "granted") {
          notifyInput.checked = false;
          status.textContent =
            "Notifications blocked — you’ll still see a gentle nudge on the home page.";
        }
      }
      persist();
    })();
  });

  syncDisabled();

  card.append(
    enabledLabel,
    timeLabel,
    timeInput,
    notifyLabel,
    el("p", {
      className: "step-hint",
      text: "After this time, the home page shows a friendly nudge until you check in.",
    }),
    status
  );
  root.append(card);

  if (!isInstalledPwa()) {
    root.append(
      el("div", { className: "card install-card" }, [
        el("h2", { text: "Add to Home Screen" }),
        el("p", {
          text: "On iPhone: tap Share, then “Add to Home Screen”. Reminders work best that way.",
        }),
      ])
    );
  }

  root.append(
    el("nav", { className: "app-footer-nav" }, [
      el("a", { text: "Back to today", attrs: { href: "#/" } }),
    ])
  );
}
