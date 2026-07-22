import { getSupabase, householdId } from "./supabase";

const BUCKET = "good-stuff-photos";

export interface GoodStuffPhoto {
  id: string;
  household_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

function requireHousehold(): string {
  if (!householdId) throw new Error("Not configured");
  return householdId;
}

export async function fetchGoodStuffPhotos(): Promise<GoodStuffPhoto[]> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("good_stuff_photos")
    .select("*")
    .eq("household_id", hid)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as GoodStuffPhoto[];
}

async function uploadGoodStuffFile(file: File): Promise<string> {
  const hid = requireHousehold();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "heic"].includes(ext)
    ? ext
    : "jpg";
  const path = `${hid}/${Date.now()}.${safeExt}`;

  const supabase = getSupabase();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function addGoodStuffPhoto(
  file: File,
  caption?: string
): Promise<GoodStuffPhoto> {
  const supabase = getSupabase();
  const hid = requireHousehold();
  const photo_url = await uploadGoodStuffFile(file);
  const cap = caption?.trim() || null;

  const { data, error } = await supabase
    .from("good_stuff_photos")
    .insert({ household_id: hid, photo_url, caption: cap })
    .select()
    .single();

  if (error) throw error;
  return data as GoodStuffPhoto;
}

export function pickRandomGoodStuff(
  photos: GoodStuffPhoto[]
): GoodStuffPhoto | null {
  if (photos.length === 0) return null;
  return photos[Math.floor(Math.random() * photos.length)] ?? null;
}

export function formatGoodStuffDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
