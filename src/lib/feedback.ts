import { getSupabase, householdId } from "./supabase";

export type FeedbackKind = "bug" | "feature";
export type FeedbackStatus = "open" | "planned" | "fixed" | "wontfix";

export interface FeedbackItem {
  id: string;
  household_id: string;
  kind: FeedbackKind;
  title: string;
  details: string;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
}

function requireHousehold(): string {
  if (!householdId) throw new Error("Household ID is not configured");
  return householdId;
}

export async function fetchFeedbackItems(): Promise<FeedbackItem[]> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("feedback_items")
    .select("*")
    .eq("household_id", hid)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createFeedbackItem(input: {
  kind: FeedbackKind;
  title: string;
  details: string;
}): Promise<FeedbackItem> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("feedback_items")
    .insert({
      household_id: hid,
      kind: input.kind,
      title: input.title.trim(),
      details: input.details.trim(),
      status: "open",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus
): Promise<void> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { error } = await supabase
    .from("feedback_items")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("household_id", hid);

  if (error) throw error;
}

function mapRow(data: Record<string, unknown>): FeedbackItem {
  return {
    id: data.id as string,
    household_id: data.household_id as string,
    kind: data.kind as FeedbackKind,
    title: data.title as string,
    details: data.details as string,
    status: data.status as FeedbackStatus,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export function kindLabel(kind: FeedbackKind): string {
  return kind === "bug" ? "Bug" : "Feature";
}

export function statusLabel(status: FeedbackStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "planned":
      return "Planned";
    case "fixed":
      return "Fixed";
    case "wontfix":
      return "Won’t fix";
  }
}
