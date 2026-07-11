import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function hasSupabaseAdminEnv(): boolean {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  return Boolean(url && key);
}

export function createAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase admin credentials");
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createAdminClientIfConfigured() {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

export function getAdminClient() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) {
    throw new Error("Missing Supabase admin credentials");
  }
  return supabase;
}
