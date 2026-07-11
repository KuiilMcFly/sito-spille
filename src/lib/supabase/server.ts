import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv, hasSupabasePublicEnv } from "@/lib/supabase/env";

export async function createClient() {
  const { url, key } = getSupabasePublicEnv();

  if (!url || !key) {
    throw new Error("Missing Supabase public credentials");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
        }
      },
    },
  });
}

export async function createClientIfConfigured() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function getServerUser() {
  const supabase = await createClientIfConfigured();
  if (!supabase) {
    return null;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
