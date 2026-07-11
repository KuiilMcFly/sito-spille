import type { Tables } from "@/types/database";

export function getCustomPrice(size: {
  custom_price?: number | null;
  base_price: number;
}) {
  if (size.custom_price != null && size.custom_price > 0) {
    return size.custom_price;
  }
  return size.base_price;
}

export function calcShippingCost(
  subtotal: number,
  methodPrice: number,
  freeShippingThreshold: number
) {
  if (subtotal >= freeShippingThreshold) return 0;
  return methodPrice;
}

export type PinSize = Tables<"pin_sizes">;
export type ShippingMethod = Tables<"shipping_methods">;
