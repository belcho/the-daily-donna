import { householdId } from "./env";

export async function hashDonnaPin(pin: string): Promise<string> {
  const hid = householdId ?? "";
  const data = new TextEncoder().encode(`${hid}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashAdminPin(pin: string): Promise<string> {
  const hid = householdId ?? "";
  const data = new TextEncoder().encode(`${hid}:admin:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
