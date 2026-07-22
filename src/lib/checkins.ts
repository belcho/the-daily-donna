import type { CheckinRow, CheckinFormState, CheckinStatus } from "../types";
import { formStateToRowFields } from "../types";
import { getSupabase, householdId } from "./supabase";

function requireHousehold(): string {
  if (!householdId) {
    throw new Error("Household ID is not configured");
  }
  return householdId;
}

export async function fetchCheckinByDate(
  checkinDate: string
): Promise<CheckinRow | null> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("household_id", hid)
    .eq("checkin_date", checkinDate)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapRow(data);
}

export async function fetchSubmittedHistory(): Promise<CheckinRow[]> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("household_id", hid)
    .eq("status", "submitted")
    .order("checkin_date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Any check-in day that has a saved photo (draft or submitted). */
export async function fetchCheckinsWithPhotos(): Promise<CheckinRow[]> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("household_id", hid)
    .not("photo_url", "is", null)
    .order("checkin_date", { ascending: false });

  if (error) throw error;
  return (data ?? [])
    .map(mapRow)
    .filter((r) => r.photo_url?.trim());
}

export async function saveDraft(
  checkinDate: string,
  form: CheckinFormState
): Promise<CheckinRow> {
  const existing = await fetchCheckinByDate(checkinDate);
  const status: CheckinStatus =
    existing?.status === "submitted" ? "submitted" : "draft";
  return upsertCheckin(checkinDate, form, status);
}

export async function submitCheckin(
  checkinDate: string,
  form: CheckinFormState
): Promise<CheckinRow> {
  return upsertCheckin(checkinDate, form, "submitted");
}

async function upsertCheckin(
  checkinDate: string,
  form: CheckinFormState,
  status: CheckinStatus
): Promise<CheckinRow> {
  const supabase = getSupabase();
  const hid = requireHousehold();
  const fields = formStateToRowFields(form, status);

  const payload = {
    household_id: hid,
    checkin_date: checkinDate,
    ...fields,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("checkins")
    .upsert(payload, { onConflict: "household_id,checkin_date" })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

function mapRow(data: Record<string, unknown>): CheckinRow {
  const appointments = Array.isArray(data.appointments)
    ? (data.appointments as { time: string; description: string }[])
    : [];

  return {
    id: data.id as string,
    household_id: data.household_id as string,
    checkin_date: data.checkin_date as string,
    status: data.status as CheckinRow["status"],
    mood: data.mood as number | null,
    vitamins_taken: data.vitamins_taken as boolean | null,
    vitamins_really: data.vitamins_really as CheckinRow["vitamins_really"],
    appointments,
    pain_level: data.pain_level as number | null,
    saw_bunnies: data.saw_bunnies as boolean | null,
    bunny_count: data.bunny_count as number | null,
    creatures: Array.isArray(data.creatures)
      ? (data.creatures as string[])
      : [],
    note: (data.note as string | null) ?? null,
    photo_url: (data.photo_url as string | null) ?? null,
    meal_want: (data.meal_want as string | null) ?? null,
    updated_at: data.updated_at as string | undefined,
  };
}
