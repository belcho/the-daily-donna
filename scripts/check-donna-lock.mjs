import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

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

function nodeHash(pin) {
  return createHash("sha256").update(`${hid}:${pin}`).digest("hex");
}

const { data, error } = await sb
  .from("household_settings")
  .select("household_id, donna_pin_hash, admin_pin_hash, updated_at")
  .eq("household_id", hid)
  .maybeSingle();

if (error) {
  console.log("DB_ERROR", error.message, error.code);
  process.exit(1);
}

console.log("household_id_env", hid);
console.log("row_found", Boolean(data));
if (data) {
  console.log("donna_pin_set", Boolean(data.donna_pin_hash));
  console.log("donna_pin_hash_len", data.donna_pin_hash?.length ?? 0);
  console.log("admin_pin_set", Boolean(data.admin_pin_hash));
  console.log("updated_at", data.updated_at);
}

const { data: allRows, error: allErr } = await sb
  .from("household_settings")
  .select("household_id, donna_pin_hash");

if (!allErr) {
  console.log("total_settings_rows", allRows?.length ?? 0);
  for (const r of allRows ?? []) {
    console.log(
      "  row",
      r.household_id,
      "donna=",
      Boolean(r.donna_pin_hash)
    );
  }
}
