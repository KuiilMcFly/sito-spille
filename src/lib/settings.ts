import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export async function getSiteSetting<T>(key: string, fallback: T): Promise<T> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (!data?.value) return fallback;
  return data.value as T;
}

export async function getPublicSettings() {
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
}
