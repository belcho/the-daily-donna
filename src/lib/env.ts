declare global {
  interface Window {
    __DONNA_ENV__?: Record<string, string>;
  }
}

export {};

function readEnv(key: string): string | undefined {
  const fromWindow = window.__DONNA_ENV__?.[key]?.trim();
  if (fromWindow) return fromWindow;
  const fromImport = import.meta.env[key as keyof ImportMetaEnv];
  if (typeof fromImport === "string" && fromImport.trim()) {
    return fromImport.trim();
  }
  return undefined;
}

export const supabaseUrl = readEnv("VITE_SUPABASE_URL");
export const supabaseAnonKey = readEnv("VITE_SUPABASE_ANON_KEY");
export const householdId = readEnv("VITE_HOUSEHOLD_ID");

export function isConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && householdId);
}
