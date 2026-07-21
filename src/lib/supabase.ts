import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { householdId, isConfigured, supabaseAnonKey, supabaseUrl } from "./env";

export { householdId, isConfigured };

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase is not configured");
  }
  if (!client) {
    const headers: Record<string, string> = {};
    if (householdId) {
      headers["x-household-id"] = householdId;
    }
    client = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers },
    });
  }
  return client;
}
