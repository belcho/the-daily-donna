import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const householdId = import.meta.env.VITE_HOUSEHOLD_ID as string | undefined;

export function isConfigured(): boolean {
  return Boolean(url && anonKey && householdId);
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured");
  }
  if (!client) {
    const headers: Record<string, string> = {};
    if (householdId) {
      headers["x-household-id"] = householdId;
    }
    client = createClient(url, anonKey, {
      global: { headers },
    });
  }
  return client;
}
