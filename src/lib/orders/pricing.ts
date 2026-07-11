import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import type { Tables } from "@/types/database";

export async function getFreeShippingThreshold() {
  if (!hasSupabaseAdminEnv()) {
    return 35;
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "free_shipping_threshold")
      .single();

    const value = data?.value as { amount?: number } | null;
    return value?.amount ?? 35;
  } catch {
    return 35;
  }
}

export async function getShippingMethods() {
  if (!hasSupabaseAdminEnv()) {
    return [] as Tables<"shipping_methods">[];
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("shipping_methods")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    return (data || []) as Tables<"shipping_methods">[];
  } catch {
    return [] as Tables<"shipping_methods">[];
  }
}

export async function getShippingMethodById(id: string) {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("shipping_methods")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    return data as Tables<"shipping_methods"> | null;
  } catch {
    return null;
  }
}

export async function calculateShippingCost(
  subtotal: number,
  shippingMethodId: string | null
) {
  const threshold = await getFreeShippingThreshold();

  if (subtotal >= threshold) {
    return { cost: 0, isFree: true, threshold };
  }

  if (!shippingMethodId) {
    return { cost: 0, isFree: false, threshold };
  }

  const method = await getShippingMethodById(shippingMethodId);
  return {
    cost: method?.price ?? 0,
    isFree: false,
    threshold,
    methodName: method?.name,
  };
}

export function calculateLineTotal(unitPrice: number, quantity: number) {
  return Math.round(unitPrice * quantity * 100) / 100;
}

export function calculateOrderTotal(subtotal: number, shippingCost: number) {
  return Math.round((subtotal + shippingCost) * 100) / 100;
}

export function getCustomPrice(size: { custom_price?: number | null; base_price: number }) {
  if (size.custom_price != null && size.custom_price > 0) {
    return size.custom_price;
  }
  return size.base_price;
}
