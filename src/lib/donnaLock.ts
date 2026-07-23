import { getSupabase, householdId, isConfigured } from "./supabase";
import { hashDonnaPin, hashDonnaPinLegacy } from "./pinHash";
import { isAdminSession, fetchHouseholdSettings } from "./adminLock";

const SESSION_KEY = "donna_unlocked";
/** Survives iOS PWA tab reloads when sessionStorage is cleared. */
const DEVICE_UNLOCK_KEY = "donna_device_unlocked";
const REMEMBER_KEY = "donna_saved_code";

function requireHousehold(): string {
  if (!householdId) {
    throw new Error("Household ID is not configured");
  }
  return householdId;
}

export async function fetchDonnaPinHash(): Promise<string | null> {
  const row = await fetchHouseholdSettings();
  return row?.donna_pin_hash ?? null;
}

export async function saveDonnaPin(pin: string): Promise<void> {
  const supabase = getSupabase();
  const hid = requireHousehold();
  const donna_pin_hash = await hashDonnaPin(pin.trim());
  const existing = await fetchHouseholdSettings();

  const { error } = await supabase.from("household_settings").upsert(
    {
      household_id: hid,
      donna_pin_hash,
      admin_pin_hash: existing?.admin_pin_hash ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "household_id" }
  );

  if (error) throw error;
}

export async function pinMatches(pin: string, storedHash: string): Promise<boolean> {
  const trimmed = pin.trim();
  if (!trimmed) return false;
  const [h, legacy] = await Promise.all([
    hashDonnaPin(trimmed),
    hashDonnaPinLegacy(trimmed),
  ]);
  return h === storedHash || legacy === storedHash;
}

export function markSessionUnlocked(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* private mode / storage blocked */
  }
  try {
    localStorage.setItem(DEVICE_UNLOCK_KEY, "1");
  } catch {
    /* */
  }
}

export function isSessionUnlocked(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return true;
  } catch {
    /* */
  }
  try {
    return localStorage.getItem(DEVICE_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function getRememberedCode(): string | null {
  return localStorage.getItem(REMEMBER_KEY);
}

export function setRememberedCode(pin: string | null): void {
  if (pin) {
    localStorage.setItem(REMEMBER_KEY, pin.trim());
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

export function lockSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* */
  }
  try {
    localStorage.removeItem(DEVICE_UNLOCK_KEY);
  } catch {
    /* */
  }
}

export type DonnaLockState = "setup" | "unlock" | "ok";

/** Whether the app should show setup, unlock, or proceed. */
export async function resolveDonnaLockState(): Promise<DonnaLockState> {
  if (!isConfigured()) return "ok";
  if (isAdminSession()) return "ok";

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
  if (remembered) {
    setRememberedCode(null);
  }

  return "unlock";
}

export async function unlockWithPin(
  pin: string,
  remember: boolean
): Promise<{ ok: true } | { ok: false; message: string }> {
  const code = pin.trim();
  if (!code) {
    return { ok: false, message: "Enter your code to continue." };
  }

  if (!crypto.subtle) {
    return {
      ok: false,
      message:
        "This browser can’t verify your code securely. Try opening the link in Safari or Chrome.",
    };
  }

  let storedHash: string | null;
  try {
    storedHash = await fetchDonnaPinHash();
  } catch {
    return {
      ok: false,
      message: "Could not reach the server. Check Wi‑Fi or signal and try again.",
    };
  }

  if (!storedHash) {
    return { ok: false, message: "No private code set up yet." };
  }
  if (!(await pinMatches(code, storedHash))) {
    return { ok: false, message: "That code doesn’t match. Try again?" };
  }
  markSessionUnlocked();
  if (remember) {
    setRememberedCode(code);
  } else {
    setRememberedCode(null);
  }
  return { ok: true };
}
