import { createAdminClient } from "@/lib/supabase/admin";
import {
  shippingAddressFromRow,
  shippingAddressToJson,
  type ShippingAddressPayload,
} from "@/lib/addresses/types";

export async function resolveCheckoutShippingAddress(input: {
  userId?: string | null;
  addressId?: string | null;
  shippingAddress?: ShippingAddressPayload | null;
}): Promise<Record<string, unknown> | null> {
  if (input.addressId && input.userId) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("id", input.addressId)
      .eq("user_id", input.userId)
      .single();

    if (data) {
      return shippingAddressToJson(shippingAddressFromRow(data));
    }
  }

  if (input.shippingAddress) {
    const addr = input.shippingAddress;
    if (
      addr.streetLine1.trim() &&
      addr.city.trim() &&
      addr.province.trim() &&
      addr.postalCode.trim()
    ) {
      return shippingAddressToJson(addr);
    }
  }

  return null;
}

export async function maybeSaveCheckoutAddress(input: {
  userId?: string | null;
  saveAddress?: boolean;
  shippingAddress?: ShippingAddressPayload | null;
}) {
  if (!input.userId || !input.saveAddress || !input.shippingAddress) return;

  const addr = input.shippingAddress;
  if (!addr.streetLine1.trim() || !addr.city.trim() || !addr.province.trim() || !addr.postalCode.trim()) {
    return;
  }

  const supabase = createAdminClient();
  const { count } = await supabase
    .from("customer_addresses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", input.userId);

  const isDefault = (count || 0) === 0;

  if (isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", input.userId);
  }

  await supabase.from("customer_addresses").insert({
    user_id: input.userId,
    label: addr.label || "Casa",
    full_name: addr.fullName || null,
    phone: addr.phone || null,
    street_line1: addr.streetLine1.trim(),
    street_line2: addr.streetLine2?.trim() || null,
    city: addr.city.trim(),
    province: addr.province.trim(),
    postal_code: addr.postalCode.trim(),
    country: addr.country || "IT",
    is_default: isDefault,
  });
}
