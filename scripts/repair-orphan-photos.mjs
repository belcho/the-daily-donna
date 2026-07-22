/**
 * One-off: attach orphan storage files to check-ins missing photo_url.
 * Run: node scripts/repair-orphan-photos.mjs
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "checkin-photos";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  global: { headers: { "x-household-id": env.VITE_HOUSEHOLD_ID } },
});
const hid = env.VITE_HOUSEHOLD_ID;

const { data: days, error: listErr } = await sb.storage
  .from(BUCKET)
  .list(hid, { limit: 100 });

if (listErr) {
  console.error(listErr.message);
  process.exit(1);
}

let repaired = 0;

for (const day of days ?? []) {
  const dateKey = day.name;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;

  const { data: files } = await sb.storage
    .from(BUCKET)
    .list(`${hid}/${dateKey}`, { limit: 100 });

  const imageFiles = (files ?? []).filter(
    (f) => f.name && !f.name.endsWith("/")
  );
  if (imageFiles.length === 0) continue;

  imageFiles.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));
  const latest = imageFiles[0];
  const path = `${hid}/${dateKey}/${latest.name}`;
  const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const { data: row } = await sb
    .from("checkins")
    .select("photo_url,status")
    .eq("household_id", hid)
    .eq("checkin_date", dateKey)
    .maybeSingle();

  if (row?.photo_url?.trim()) continue;

  if (!row) {
    console.log("skip", dateKey, "— no check-in row for this day");
    continue;
  }

  const { error: upErr } = await sb
    .from("checkins")
    .update({ photo_url: publicUrl })
    .eq("household_id", hid)
    .eq("checkin_date", dateKey);

  if (upErr) {
    console.error("update failed", dateKey, upErr.message);
    continue;
  }

  console.log("linked photo for", dateKey);
  repaired++;
}

console.log("done, repaired", repaired);
