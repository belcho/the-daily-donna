import { householdId } from "./env";

function normalizePin(pin: string): string {
  return pin.trim();
}

export async function hashDonnaPin(pin: string): Promise<string> {
  const hid = householdId ?? "";
  const normalized = normalizePin(pin);
  const data = new TextEncoder().encode(`${hid}:${normalized}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Pins saved before household id was in the build used an empty id prefix. */
export async function hashDonnaPinLegacy(pin: string): Promise<string> {
  const normalized = normalizePin(pin);
  const data = new TextEncoder().encode(`:${normalized}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashAdminPin(pin: string): Promise<string> {
  const hid = householdId ?? "";
  const normalized = normalizePin(pin);
  const data = new TextEncoder().encode(`${hid}:admin:${normalized}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
