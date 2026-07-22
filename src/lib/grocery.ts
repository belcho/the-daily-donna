import { getSupabase, householdId } from "./supabase";
import { getGroceryWeekKey } from "./groceryWeek";

export interface GroceryItem {
  id: string;
  household_id: string;
  week_key: string;
  name: string;
  is_got: boolean;
  created_at: string;
}

function requireHousehold(): string {
  if (!householdId) throw new Error("Not configured");
  return householdId;
}

export async function fetchGroceryItems(
  weekKey?: string
): Promise<GroceryItem[]> {
  const supabase = getSupabase();
  const hid = requireHousehold();
  const week = weekKey ?? getGroceryWeekKey();

  const { data, error } = await supabase
    .from("grocery_items")
    .select("*")
    .eq("household_id", hid)
    .eq("week_key", week)
    .order("is_got", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as GroceryItem[];
}

export async function addGroceryItem(name: string): Promise<GroceryItem> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Type something to add.");

  const supabase = getSupabase();
  const hid = requireHousehold();
  const week_key = getGroceryWeekKey();

  const { data, error } = await supabase
    .from("grocery_items")
    .insert({
      household_id: hid,
      week_key,
      name: trimmed,
    })
    .select()
    .single();

  if (error) throw error;
  return data as GroceryItem;
}

export async function setGroceryItemGot(
  id: string,
  is_got: boolean
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("grocery_items")
    .update({ is_got })
    .eq("id", id);

  if (error) throw error;
}

export async function markAllGroceryGot(weekKey?: string): Promise<void> {
  const supabase = getSupabase();
  const hid = requireHousehold();
  const week = weekKey ?? getGroceryWeekKey();

  const { error } = await supabase
    .from("grocery_items")
    .update({ is_got: true })
    .eq("household_id", hid)
    .eq("week_key", week)
    .eq("is_got", false);

  if (error) throw error;
}

export async function removeGotGroceryItems(weekKey?: string): Promise<void> {
  const supabase = getSupabase();
  const hid = requireHousehold();
  const week = weekKey ?? getGroceryWeekKey();

  const { error } = await supabase
    .from("grocery_items")
    .delete()
    .eq("household_id", hid)
    .eq("week_key", week)
    .eq("is_got", true);

  if (error) throw error;
}

export async function deleteGroceryItem(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("grocery_items").delete().eq("id", id);
  if (error) throw error;
}
