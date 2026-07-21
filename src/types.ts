export type CheckinStatus = "draft" | "submitted";

export type VitaminsReally = "not_all" | "yes_silly";

export interface Appointment {
  time: string;
  description: string;
}

export interface CheckinRow {
  id?: string;
  household_id: string;
  checkin_date: string;
  status: CheckinStatus;
  mood: number | null;
  vitamins_taken: boolean | null;
  vitamins_really: VitaminsReally | null;
  appointments: Appointment[];
  pain_level: number | null;
  saw_bunnies: boolean | null;
  creatures: string[];
  updated_at?: string;
}

export interface CheckinFormState {
  mood: number | null;
  vitamins_taken: boolean | null;
  vitamins_really: VitaminsReally | null;
  has_appointments: boolean | null;
  appointments: Appointment[];
  pain_level: number | null;
  saw_bunnies: boolean | null;
  more_creatures: boolean | null;
  creatures: string[];
}

export function emptyFormState(): CheckinFormState {
  return {
    mood: null,
    vitamins_taken: null,
    vitamins_really: null,
    has_appointments: null,
    appointments: [],
    pain_level: null,
    saw_bunnies: null,
    more_creatures: null,
    creatures: [],
  };
}

export function rowToFormState(row: CheckinRow): CheckinFormState {
  const hasAppts = row.appointments.length > 0;
  return {
    mood: row.mood,
    vitamins_taken: row.vitamins_taken,
    vitamins_really: row.vitamins_really,
    has_appointments:
      row.appointments.length > 0
        ? true
        : row.status === "submitted" && !hasAppts
          ? false
          : null,
    appointments: row.appointments.length ? [...row.appointments] : [],
    pain_level: row.pain_level,
    saw_bunnies: row.saw_bunnies,
    more_creatures:
      row.creatures.length > 0
        ? true
        : row.status === "submitted"
          ? false
          : null,
    creatures: [...row.creatures],
  };
}

export function formStateToRowFields(
  form: CheckinFormState,
  status: CheckinStatus
): Omit<CheckinRow, "household_id" | "checkin_date" | "id" | "updated_at"> {
  let appointments: Appointment[] = [];
  if (form.has_appointments) {
    appointments = form.appointments.filter(
      (a) => a.time.trim() || a.description.trim()
    );
  }

  let creatures: string[] = [];
  if (form.more_creatures) {
    creatures = [...form.creatures];
  }

  return {
    status,
    mood: form.mood,
    vitamins_taken: form.vitamins_taken,
    vitamins_really:
      form.vitamins_taken === true ? form.vitamins_really : null,
    appointments,
    pain_level: form.pain_level,
    saw_bunnies: form.saw_bunnies,
    creatures,
  };
}
