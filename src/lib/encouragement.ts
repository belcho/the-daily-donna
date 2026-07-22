import { getSupabase, householdId } from "./supabase";

export interface EncouragementNote {
  id: string;
  household_id: string;
  author_name: string;
  message: string;
  created_at: string;
}

function requireHousehold(): string {
  if (!householdId) throw new Error("Not configured");
  return householdId;
}

export async function fetchEncouragementNotes(): Promise<EncouragementNote[]> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("encouragement_notes")
    .select("*")
    .eq("household_id", hid)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as EncouragementNote[];
}

export async function addEncouragementNote(
  message: string,
  authorName: string
): Promise<EncouragementNote> {
  const supabase = getSupabase();
  const hid = requireHousehold();
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Message is empty");

  const { data, error } = await supabase
    .from("encouragement_notes")
    .insert({
      household_id: hid,
      message: trimmed,
      author_name: authorName.trim() || "Someone who loves you",
    })
    .select()
    .single();

  if (error) throw error;
  return data as EncouragementNote;
}

export function pickEncouragementNote(
  notes: EncouragementNote[]
): EncouragementNote | null {
  if (notes.length === 0) return null;
  const idx = Math.floor(Math.random() * notes.length);
  return notes[idx] ?? null;
}
