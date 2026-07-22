import { getSupabase, householdId, isConfigured } from "./supabase";
import { hashDonnaPin } from "./pinHash";

const SESSION_KEY = "donna_unlocked";
const REMEMBER_KEY = "donna_saved_code";

function requireHousehold(): string {
  if (!householdId) {
    throw new Error("Household ID is not configured");
  }
  return householdId;
}

export async function fetchDonnaPinHash(): Promise<string | null> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("household_settings")
    .select("donna_pin_hash")
    .eq("household_id", hid)
    .maybeSingle();

  if (error) throw error;
  return data?.donna_pin_hash ?? null;
}

export async function saveDonnaPin(pin: string): Promise<void> {
  const supabase = getSupabase();
  const hid = requireHousehold();
  const donna_pin_hash = await hashDonnaPin(pin);

  const { error } = await supabase.from("household_settings").upsert(
    {
      household_id: hid,
      donna_pin_hash,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "household_id" }
  );

  if (error) throw error;
}

export async function pinMatches(pin: string, storedHash: string): Promise<boolean> {
  const h = await hashDonnaPin(pin);
  return h === storedHash;
}

export function markSessionUnlocked(): void {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function getRememberedCode(): string | null {
  return localStorage.getItem(REMEMBER_KEY);
}

export function setRememberedCode(pin: string | null): void {
  if (pin) {
    localStorage.setItem(REMEMBER_KEY, pin);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

export function lockSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export type DonnaLockState = "setup" | "unlock" | "ok";

/** Whether the app should show setup, unlock, or proceed. */
export async function resolveDonnaLockState(): Promise<DonnaLockState> {
  if (!isConfigured()) return "ok";

  let storedHash: string | null;
  try {
    storedHash = await fetchDonnaPinHash();
  } catch {
    // Table missing or network — allow app (degraded) so family isn’t locked out
    return "ok";
  }

  if (!storedHash) return "setup";

  if (isSessionUnlocked()) return "ok";

  const remembered = getRememberedCode();
  if (remembered && (await pinMatches(remembered, storedHash))) {
    markSessionUnlocked();
    return "ok";
  }

  return "unlock";
}

export async function unlockWithPin(
  pin: string,
  remember: boolean
): Promise<{ ok: true } | { ok: false; message: string }> {
  const storedHash = await fetchDonnaPinHash();
  if (!storedHash) {
    return { ok: false, message: "No private code set up yet." };
  }
  if (!(await pinMatches(pin, storedHash))) {
    return { ok: false, message: "That code doesn’t match. Try again?" };
  }
  markSessionUnlocked();
  if (remember) {
    setRememberedCode(pin);
  } else {
    setRememberedCode(null);
  }
  return { ok: true };
}
