import { getSupabase, householdId, isConfigured } from "./supabase";
import { hashAdminPin } from "./pinHash";

const ADMIN_SESSION_KEY = "donna_admin_session";

export interface HouseholdSettingsRow {
  donna_pin_hash: string | null;
  admin_pin_hash: string | null;
}

function requireHousehold(): string {
  if (!householdId) throw new Error("Not configured");
  return householdId;
}

export async function fetchHouseholdSettings(): Promise<HouseholdSettingsRow | null> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("household_settings")
    .select("donna_pin_hash, admin_pin_hash")
    .eq("household_id", hid)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    donna_pin_hash: data.donna_pin_hash ?? null,
    admin_pin_hash: data.admin_pin_hash ?? null,
  };
}

export async function fetchAdminPinHash(): Promise<string | null> {
  const row = await fetchHouseholdSettings();
  return row?.admin_pin_hash ?? null;
}

export async function saveAdminPin(pin: string): Promise<void> {
  const supabase = getSupabase();
  const hid = requireHousehold();
  const admin_pin_hash = await hashAdminPin(pin);
  const existing = await fetchHouseholdSettings();

  const payload: Record<string, unknown> = {
    household_id: hid,
    admin_pin_hash,
    updated_at: new Date().toISOString(),
  };
  if (existing?.donna_pin_hash) {
    payload.donna_pin_hash = existing.donna_pin_hash;
  }

  const { error } = await supabase
    .from("household_settings")
    .upsert(payload, { onConflict: "household_id" });

  if (error) throw error;
}

export async function adminPinMatches(
  pin: string,
  storedHash: string
): Promise<boolean> {
  const h = await hashAdminPin(pin);
  return h === storedHash;
}

export function isAdminSession(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

export function startAdminSession(): void {
  sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
}

export function endAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export type AdminGateState = "setup" | "login" | "hub";

export async function resolveAdminGateState(): Promise<AdminGateState> {
  if (!isConfigured()) return "login";
  if (isAdminSession()) return "hub";

  let hash: string | null;
  try {
    hash = await fetchAdminPinHash();
  } catch {
    return "login";
  }
  return hash ? "login" : "setup";
}

export async function unlockAdmin(
  pin: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const storedHash = await fetchAdminPinHash();
  if (!storedHash) {
    return { ok: false, message: "Admin code isn’t set up yet." };
  }
  if (!(await adminPinMatches(pin, storedHash))) {
    return { ok: false, message: "That admin code doesn’t match." };
  }
  startAdminSession();
  return { ok: true };
}
