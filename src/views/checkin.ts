import type { CheckinFormState } from "../types";
import { emptyFormState, rowToFormState } from "../types";
import { el, clear } from "../lib/dom";
import { getCheckinDate } from "../lib/checkinDate";
import { fetchCheckinByDate, saveDraft, submitCheckin } from "../lib/checkins";
import { isConfigured } from "../lib/supabase";
import { MOOD_LABELS } from "../data/mood";
import { CREATURES } from "../data/creatures";
import {
  facePicker,
  yesNoChoice,
  textChoice,
} from "../components/widgets";
import { renderSummary } from "../components/summary";
import { formStateToRowFields } from "../types";
import { uploadCheckinPhoto } from "../lib/photos";

const TOTAL_STEPS = 10;

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export async function renderCheckIn(root: HTMLElement): Promise<void> {
  clear(root);

  if (!isConfigured()) {
    root.append(
      el("div", {
        className: "error-banner",
        text: "This site is not fully set up yet.",
      })
    );
    return;
  }

  const checkinDate = getCheckinDate();
  let form: CheckinFormState = emptyFormState();
  let step = 1;
  let saveStatus = "";
  let saving = false;

  root.append(el("div", { className: "loading", text: "Loading…" }));

  try {
    const existing = await fetchCheckinByDate(checkinDate);
    if (existing) {
      form = rowToFormState(existing);
    }
  } catch {
    /* start fresh */
  }

  const shell = el("div");
  clear(root);
  root.append(shell);

  function scheduleSave(): void {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void persistDraft(), 800);
  }

  async function persistDraft(): Promise<void> {
    saving = true;
    saveStatus = "Saving…";
    render();
    try {
      await saveDraft(checkinDate, form);
      saveStatus = "Saved";
    } catch {
      saveStatus = "Could not save — check connection";
    }
    saving = false;
    render();
  }

  function nextStep(): number {
    if (step === 2 && form.vitamins_taken === false) return 4;
    return step + 1;
  }

  function prevStep(): number {
    if (step === 4 && form.vitamins_taken === false) return 2;
    return step - 1;
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return form.mood != null;
      case 2:
        return form.vitamins_taken != null;
      case 3:
        return form.vitamins_really != null;
      case 4:
        if (form.has_appointments == null) return false;
        if (!form.has_appointments) return true;
        return form.appointments.some(
          (a) => a.time.trim() || a.description.trim()
        );
      case 5:
        return form.pain_level != null;
      case 6:
        return form.saw_bunnies != null;
      case 7:
        if (form.more_creatures == null) return false;
        if (!form.more_creatures) return true;
        return form.creatures.length > 0;
      case 8:
        return true;
      case 9:
        return true;
      case 10:
        return true;
      default:
        return false;
    }
  }

  function renderAppointments(container: HTMLElement): void {
    clear(container);
    container.append(
      yesNoChoice(
        form.has_appointments,
        (v) => {
          form.has_appointments = v;
          if (v && form.appointments.length === 0) {
            form.appointments.push({ time: "", description: "" });
          }
          if (!v) form.appointments = [];
          scheduleSave();
          render();
        },
        "Appointments today"
      )
    );

    if (form.has_appointments) {
      const list = el("div", { className: "appointment-list" });
      form.appointments.forEach((appt, index) => {
        const row = el("div", { className: "appointment-row" });
        const timeId = `appt-time-${index}`;
        const descId = `appt-desc-${index}`;

        const timeLabel = el("label", { attrs: { for: timeId }, text: "Time" });
        const timeInput = el("input", {
          attrs: {
            id: timeId,
            type: "time",
            value: appt.time,
          },
        }) as HTMLInputElement;
        timeInput.addEventListener("change", () => {
          appt.time = timeInput.value;
          scheduleSave();
        });

        const descLabel = el("label", {
          attrs: { for: descId },
          text: "What for?",
        });
        const descInput = el("input", {
          attrs: {
            id: descId,
            type: "text",
            placeholder: "Doctor, PT, coffee with Mom…",
            value: appt.description,
          },
        }) as HTMLInputElement;
        descInput.addEventListener("input", () => {
          appt.description = descInput.value;
          scheduleSave();
        });

        row.append(timeLabel, timeInput, descLabel, descInput);

        if (form.appointments.length > 1) {
          row.append(
            el("button", {
              className: "btn btn-ghost",
              text: "Remove",
              attrs: { type: "button" },
              on: {
                click: () => {
                  form.appointments.splice(index, 1);
                  scheduleSave();
                  render();
                },
              },
            })
          );
        }
        list.append(row);
      });

      list.append(
        el("button", {
          className: "btn btn-secondary",
          text: "Add another appointment",
          attrs: { type: "button" },
          on: {
            click: () => {
              form.appointments.push({ time: "", description: "" });
              render();
            },
          },
        })
      );
      container.append(list);
    }
  }

  function renderCreatures(container: HTMLElement): void {
    clear(container);
    container.append(
      yesNoChoice(
        form.more_creatures,
        (v) => {
          form.more_creatures = v;
          if (!v) form.creatures = [];
          scheduleSave();
          render();
        },
        "More creatures"
      )
    );

    if (form.more_creatures) {
      const grid = el("div", {
        className: "creature-grid",
        attrs: { role: "group", "aria-label": "Pick creatures" },
      });
      for (const c of CREATURES) {
        const selected = form.creatures.includes(c.id);
        grid.append(
          el("button", {
            className: `creature-chip${c.silly ? " silly" : ""}`,
            text: c.label,
            attrs: {
              type: "button",
              "aria-pressed": selected ? "true" : "false",
            },
            on: {
              click: () => {
                if (selected) {
                  form.creatures = form.creatures.filter((id) => id !== c.id);
                } else {
                  form.creatures = [...form.creatures, c.id];
                }
                scheduleSave();
                render();
              },
            },
          })
        );
      }
      container.append(grid);
    }
  }

  function renderPain(container: HTMLElement): void {
    clear(container);
    container.append(
      el("p", {
        className: "step-hint",
        text: "On a scale of 1 to 10: 1 is very little pain, 10 is the worst pain you can imagine.",
      })
    );
    const grid = el("div", {
      className: "pain-grid",
      attrs: { role: "group", "aria-label": "Pain level 1 to 10" },
    });
    for (let n = 1; n <= 10; n++) {
      grid.append(
        el("button", {
          className: "pain-btn",
          text: String(n),
          attrs: {
            type: "button",
            "aria-pressed": form.pain_level === n ? "true" : "false",
            "aria-label": `Pain level ${n}`,
          },
          on: {
            click: () => {
              form.pain_level = n;
              scheduleSave();
              render();
            },
          },
        })
      );
    }
    container.append(grid);
  }

  function renderStepBody(body: HTMLElement): void {
    clear(body);

    switch (step) {
      case 1:
        body.append(
          el("h2", {
            className: "step-title",
            text: "How do you feel today?",
          }),
          facePicker(MOOD_LABELS, form.mood, (v) => {
            form.mood = v;
            scheduleSave();
            render();
          })
        );
        break;
      case 2:
        body.append(
          el("h2", {
            className: "step-title",
            text: "Did you take your vitamins today?",
          }),
          yesNoChoice(
            form.vitamins_taken,
            (v) => {
              form.vitamins_taken = v;
              if (!v) form.vitamins_really = null;
              scheduleSave();
              render();
            },
            "Vitamins today"
          )
        );
        break;
      case 3:
        body.append(
          el("h2", {
            className: "step-title",
            text: "Did you take all of them really?",
          }),
          textChoice(
            [
              { label: "No, not all of them.", value: "not_all" as const },
              {
                label: "Yes I really did, silly.",
                value: "yes_silly" as const,
              },
            ],
            form.vitamins_really,
            (v) => {
              form.vitamins_really = v;
              scheduleSave();
              render();
            },
            "Vitamins follow-up"
          )
        );
        break;
      case 4: {
        body.append(
          el("h2", {
            className: "step-title",
            text: "Do you have any appointments today?",
          })
        );
        const apptHost = el("div");
        body.append(apptHost);
        renderAppointments(apptHost);
        break;
      }
      case 5:
        body.append(
          el("h2", {
            className: "step-title",
            text: "How is your pain level today?",
          })
        );
        renderPain(body);
        break;
      case 6:
        body.append(
          el("h2", {
            className: "step-title",
            text: "Did you see any bunnies today?",
          }),
          yesNoChoice(
            form.saw_bunnies,
            (v) => {
              form.saw_bunnies = v;
              scheduleSave();
              render();
            },
            "Bunnies today"
          )
        );
        break;
      case 7: {
        body.append(
          el("h2", {
            className: "step-title",
            text: "Any more creatures?",
          })
        );
        const creatureHost = el("div");
        body.append(creatureHost);
        renderCreatures(creatureHost);
        break;
      }
      case 8: {
        body.append(
          el("h2", {
            className: "step-title",
            text: "Got a photo?",
          }),
          el("p", {
            className: "step-hint",
            text: "Optional — bunnies, creatures, or something that made you smile.",
          })
        );
        const previewHost = el("div", { className: "photo-upload-row" });
        const fileInput = el("input", {
          attrs: {
            type: "file",
            accept: "image/*",
            capture: "environment",
          },
        }) as HTMLInputElement;

        function showPreview(url: string | null): void {
          clear(previewHost);
          if (url) {
            previewHost.append(
              el("img", {
                className: "photo-preview",
                attrs: { src: url, alt: "Your photo for today" },
              })
            );
          }
        }
        showPreview(form.photo_url);

        fileInput.addEventListener("change", () => {
          const file = fileInput.files?.[0];
          if (!file) return;
          saveStatus = "Uploading photo…";
          render();
          void (async () => {
            try {
              const url = await uploadCheckinPhoto(checkinDate, file);
              form.photo_url = url;
              showPreview(url);
              await persistDraft();
            } catch {
              saveStatus = "Photo upload failed — is storage set up?";
              render();
            }
          })();
        });

        body.append(fileInput, previewHost);
        if (form.photo_url) {
          body.append(
            el("button", {
              className: "btn btn-ghost",
              text: "Remove photo",
              attrs: { type: "button" },
              on: {
                click: () => {
                  form.photo_url = null;
                  showPreview(null);
                  scheduleSave();
                  render();
                },
              },
            })
          );
        }
        break;
      }
      case 9: {
        body.append(
          el("h2", {
            className: "step-title",
            text: "Anything else today?",
          }),
          el("p", {
            className: "step-hint",
            text: "Optional note — skip if you like.",
          })
        );
        const noteInput = el("textarea", {
          className: "note-input",
          attrs: {
            rows: "4",
            placeholder: "A thought, a win, or what you’re looking forward to…",
          },
        }) as HTMLTextAreaElement;
        noteInput.value = form.note;
        noteInput.addEventListener("input", () => {
          form.note = noteInput.value;
          scheduleSave();
        });
        body.append(noteInput);
        break;
      }
      case 10: {
        body.append(
          el("h2", {
            className: "step-title",
            text: "Look good?",
          }),
          el("p", {
            className: "step-hint",
            text: "Here’s what we’ll save for today.",
          })
        );
        const preview = formStateToRowFields(form, "submitted");
        const fakeRow = {
          household_id: "",
          checkin_date: checkinDate,
          ...preview,
        };
        body.append(el("div", { className: "review-block" }, [renderSummary(fakeRow)]));
        break;
      }
    }
  }

  async function handleSubmit(): Promise<void> {
    try {
      await submitCheckin(checkinDate, form);
      window.location.hash = "#/";
    } catch (err) {
      saveStatus =
        err instanceof Error ? err.message : "Could not submit. Try again.";
      render();
    }
  }

  function render(): void {
    clear(shell);

    shell.append(
      el("header", { className: "app-header" }, [
        el("h1", { text: "Today’s check-in" }),
        el("p", {
          className: "progress",
          text: `Step ${step} of ${TOTAL_STEPS}`,
        }),
      ])
    );

    const card = el("div", { className: "card" });
    const body = el("div");
    renderStepBody(body);
    card.append(body);
    shell.append(card);

    shell.append(
      el("p", {
        className: "save-hint",
        text: saving ? "Saving…" : saveStatus,
      })
    );

    const nav = el("div", { className: "nav-row" });
    if (step > 1) {
      nav.append(
        el("button", {
          className: "btn btn-secondary",
          text: "Back",
          attrs: { type: "button" },
          on: {
            click: () => {
              step = prevStep();
              render();
            },
          },
        })
      );
    } else {
      nav.append(el("span", { className: "spacer" }));
    }

    if (step < TOTAL_STEPS) {
      const nextBtn = el("button", {
        className: "btn btn-primary",
        text: "Next",
        attrs: { type: "button" },
        on: {
          click: () => {
            if (!canAdvance()) return;
            step = nextStep();
            render();
          },
        },
      });
      if (!canAdvance()) nextBtn.setAttribute("disabled", "");
      nav.append(nextBtn);
    } else {
      nav.append(
        el("button", {
          className: "btn btn-primary",
          text: "Submit today’s check-in",
          attrs: { type: "button" },
          on: { click: () => void handleSubmit() },
        })
      );
    }
    shell.append(nav);

    shell.append(
      el("nav", { className: "app-footer-nav" }, [
        el("a", { text: "Cancel", attrs: { href: "#/" } }),
      ])
    );
  }

  render();
}
