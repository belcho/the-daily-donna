import { getSupabase, householdId } from "./supabase";

export type VideoPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "vimeo"
  | "other";

export interface SharedVideo {
  id: string;
  household_id: string;
  url: string;
  platform: VideoPlatform;
  note: string | null;
  created_at: string;
}

function requireHousehold(): string {
  if (!householdId) throw new Error("Not configured");
  return householdId;
}

export function parseShareUrl(raw: string): URL | null {
  let s = raw.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

export function detectPlatform(url: URL): VideoPlatform {
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
  if (host.includes("tiktok.com")) return "tiktok";
  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("facebook.com") || host === "fb.watch") return "facebook";
  if (host.includes("vimeo.com")) return "vimeo";
  return "other";
}

export function platformLabel(platform: VideoPlatform): string {
  switch (platform) {
    case "youtube":
      return "YouTube";
    case "tiktok":
      return "TikTok";
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
    case "vimeo":
      return "Vimeo";
    default:
      return "Link";
  }
}

export function platformEmoji(platform: VideoPlatform): string {
  switch (platform) {
    case "youtube":
      return "▶️";
    case "tiktok":
      return "🎵";
    case "instagram":
      return "📷";
    case "facebook":
      return "👋";
    case "vimeo":
      return "🎬";
    default:
      return "🔗";
  }
}

/** YouTube embed URL, or null if not a playable watch link. */
export function youtubeEmbedUrl(pageUrl: string): string | null {
  const parsed = parseShareUrl(pageUrl);
  if (!parsed || detectPlatform(parsed) !== "youtube") return null;

  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  let id: string | null = null;

  if (host === "youtu.be") {
    id = parsed.pathname.replace(/^\//, "").split("/")[0] || null;
  } else if (parsed.pathname.startsWith("/embed/")) {
    id = parsed.pathname.split("/")[2] ?? null;
  } else {
    id = parsed.searchParams.get("v");
    if (!id && parsed.pathname.startsWith("/shorts/")) {
      id = parsed.pathname.split("/")[2] ?? null;
    }
  }

  if (!id || !/^[a-zA-Z0-9_-]{6,}$/.test(id)) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export async function fetchSharedVideos(): Promise<SharedVideo[]> {
  const supabase = getSupabase();
  const hid = requireHousehold();

  const { data, error } = await supabase
    .from("shared_videos")
    .select("*")
    .eq("household_id", hid)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SharedVideo[];
}

export async function addSharedVideo(
  rawUrl: string,
  note?: string
): Promise<SharedVideo> {
  const parsed = parseShareUrl(rawUrl);
  if (!parsed) throw new Error("That doesn’t look like a valid link.");

  const supabase = getSupabase();
  const hid = requireHousehold();
  const platform = detectPlatform(parsed);
  const url = parsed.toString();
  const trimmedNote = note?.trim() || null;

  const { data, error } = await supabase
    .from("shared_videos")
    .insert({
      household_id: hid,
      url,
      platform,
      note: trimmedNote,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SharedVideo;
}

export function formatSharedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
