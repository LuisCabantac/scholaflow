import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createStorageClient() {
  return createSupabaseClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
