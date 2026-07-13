import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { createClientIfConfigured } from "@/lib/supabase/server";

export async function getPublicReadClient(): Promise<SupabaseClient<Database> | null> {
  const admin = createAdminClientIfConfigured();
  if (admin) {
    return admin;
  }
  return createClientIfConfigured();
}
