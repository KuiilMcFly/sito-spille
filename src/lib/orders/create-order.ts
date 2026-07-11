import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateOrderTotal,
  calculateShippingCost,
} from "@/lib/orders/pricing";
import { buildOrderLines } from "@/lib/orders/build-cart-lines";
import { applyBestPromotion } from "@/lib/promotions/apply";
import { loadActivePromotions } from "@/lib/promotions/load";
import type { CheckoutItemPayload } from "@/lib/cart/types";

export type CreateOrderInput = {
  items: CheckoutItemPayload[];
  email: string;
  phone: string;
  name?: string | null;
  notes?: string | null;
  shippingMethodId: string;
  userId?: string | null;
  promotionCode?: string | null;
};

export async function createMultiItemOrder(input: CreateOrderInput) {
  const supabase = createAdminClient();
  const { lines, orderType } = await buildOrderLines(input.items);

  const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const promotions = await loadActivePromotions();
  const applied = applyBestPromotion(
    promotions,
    lines.map((l) => l.promoLine),
    input.promotionCode
  );

  let shipping = await calculateShippingCost(subtotal, input.shippingMethodId);
  if (applied.freeShipping) {
    shipping = { ...shipping, cost: 0, isFree: true };
  }

  const discountedSubtotal = applied.subtotalAfterDiscount;
  const totalAmount = calculateOrderTotal(discountedSubtotal, shipping.cost);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: "",
      order_type: orderType,
      status: "pending_payment",
      customer_email: input.email.trim(),
      customer_phone: input.phone.trim(),
      customer_name: input.name || null,
      customer_notes: input.notes || null,
      subtotal,
      discount_amount: applied.discountAmount,
      promotion_id: applied.promotionId,
      promotion_code: applied.promotionCode,
      shipping_cost: shipping.cost,
      total_amount: totalAmount,
      currency: "EUR",
      user_id: input.userId || null,
      shipping_method_id: input.shippingMethodId,
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error("Errore creazione ordine");
  }

  const rows = lines.map((line) => ({
    pin_size_id: line.pin_size_id,
    product_id: line.product_id,
    quantity: line.quantity,
    unit_price: line.unit_price,
    line_total: line.line_total,
    is_custom: line.is_custom,
    custom_design_path: line.custom_design_path,
    customization_data: line.customization_data,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(rows);
  if (itemsError) {
    throw new Error("Errore righe ordine");
  }

  if (applied.promotionId) {
    const promo = promotions.find((p) => p.id === applied.promotionId);
    if (promo) {
      await supabase
        .from("promotions")
        .update({ usage_count: promo.usage_count + 1 })
        .eq("id", promo.id);
    }
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    discountAmount: applied.discountAmount,
    promotionName: applied.promotionName,
  };
}
