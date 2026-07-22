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

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  global: { headers: { "x-household-id": env.VITE_HOUSEHOLD_ID } },
});
const hid = env.VITE_HOUSEHOLD_ID;

const { data: rows, error } = await sb
  .from("checkins")
  .select("*")
  .eq("household_id", hid)
  .order("checkin_date", { ascending: false });

if (error) {
  console.log("DB_ERROR", error.message);
  process.exit(1);
}

const withPhoto = (rows ?? []).filter((r) => r.photo_url?.trim());
console.log("total_checkins", rows?.length ?? 0);
console.log("with_photo_url", withPhoto.length);
for (const r of withPhoto) {
  console.log(r.checkin_date, r.status, Boolean(r.photo_url));
}
if ((rows ?? []).length > 0) {
  const r = rows[0];
  console.log("latest_checkin", r.checkin_date, r.status, "photo_url=", r.photo_url);
}

const { data: list, error: se } = await sb.storage
  .from("checkin-photos")
  .list(hid, { limit: 50 });

if (se) {
  console.log("STORAGE_LIST_ERROR", se.message);
} else {
  let fileCount = 0;
  for (const day of list ?? []) {
    const { data: files } = await sb.storage
      .from("checkin-photos")
      .list(`${hid}/${day.name}`, { limit: 50 });
    fileCount += (files ?? []).filter((f) => f.name && !f.name.endsWith("/")).length;
  }
  console.log("storage_date_folders", list?.length ?? 0);
  console.log("storage_file_count", fileCount);
  for (const day of list ?? []) {
    const { data: files } = await sb.storage
      .from("checkin-photos")
      .list(`${hid}/${day.name}`, { limit: 50 });
    for (const f of files ?? []) {
      if (f.name) console.log("storage_file", `${hid}/${day.name}/${f.name}`);
    }
  }
}
