import { getSupabase, householdId } from "./supabase";

const BUCKET = "checkin-photos";

export async function uploadCheckinPhoto(
  checkinDate: string,
  file: File
): Promise<string> {
  if (!householdId) throw new Error("Not configured");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "heic"].includes(ext)
    ? ext
    : "jpg";
  const path = `${householdId}/${checkinDate}/${Date.now()}.${safeExt}`;

  const supabase = getSupabase();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function removeCheckinPhoto(publicUrl: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = decodeURIComponent(publicUrl.slice(idx + marker.length));
  const supabase = getSupabase();
  await supabase.storage.from(BUCKET).remove([path]);
}
