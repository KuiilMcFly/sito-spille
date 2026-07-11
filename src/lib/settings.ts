import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export async function getSiteSetting<T>(key: string, fallback: T): Promise<T> {
  if (!hasSupabaseAdminEnv()) {
    return fallback;
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (!data?.value) return fallback;
    return data.value as T;
  } catch {
    return fallback;
  }
}

export async function getPublicSettings() {
  if (!hasSupabaseAdminEnv()) {
    return {};
  }

  try {
    const supabase = createAdminClient();
    const keys = [
      "shipping_flat_rate",
      "min_order_amount",
      "store_email",
      "store_phone",
      "hero_title",
      "hero_subtitle",
    ];

    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", keys);

    const settings: Record<string, Json> = {};
    data?.forEach((row) => {
      settings[row.key] = row.value;
    });

    return settings;
  } catch {
    return {};
  }
}

export const DEFAULT_STORE_NAME = "Valeria Senpai";
export const DEFAULT_STORE_TAGLINE = "Spille Custom";

export async function getStoreBranding() {
  const nameSetting = await getSiteSetting<{ text?: string }>("store_name", {
    text: DEFAULT_STORE_NAME,
  });
  const taglineSetting = await getSiteSetting<{ text?: string }>("store_tagline", {
    text: DEFAULT_STORE_TAGLINE,
  });

  const name = nameSetting.text || DEFAULT_STORE_NAME;
  const tagline = taglineSetting.text || DEFAULT_STORE_TAGLINE;
  const fullTitle = (name + " " + tagline).trim();

  return { name, tagline, fullTitle };
}
