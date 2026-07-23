/**
 * Emergency: clear Donna's PIN hash so she can set a new code on next visit.
 * Run from repo root (needs .env): node scripts/reset-donna-pin.mjs
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

const hid = env.VITE_HOUSEHOLD_ID;
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  global: { headers: { "x-household-id": hid } },
});

const { error } = await sb
  .from("household_settings")
  .update({ donna_pin_hash: null, updated_at: new Date().toISOString() })
  .eq("household_id", hid);

if (error) {
  console.error("FAILED", error.message);
  process.exit(1);
}

console.log("Donna PIN cleared. She will see set-up-your-code on next open.");
