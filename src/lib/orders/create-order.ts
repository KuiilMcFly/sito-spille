import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";
import {
  calculateLineTotal,
  calculateOrderTotal,
  calculateShippingCost,
  getCustomPrice,
} from "@/lib/orders/pricing";
import type { CheckoutItemPayload } from "@/lib/cart/types";
import type { CustomizationData } from "@/types/database";

export type CreateOrderInput = {
  items: CheckoutItemPayload[];
  email: string;
  phone: string;
  name?: string | null;
  notes?: string | null;
  shippingMethodId: string;
  userId?: string | null;
};

export async function createMultiItemOrder(input: CreateOrderInput) {
  const supabase = createAdminClient();
  let subtotal = 0;
  let hasCustom = false;
  let hasCatalog = false;

  const lineInserts: {
    pin_size_id: string;
    product_id: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
    is_custom: boolean;
    custom_design_path: string | null;
    customization_data: CustomizationData | null;
  }[] = [];

  for (const item of input.items) {
    if (item.type === "catalog") {
      hasCatalog = true;
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.productId)
        .eq("is_active", true)
        .single();

      if (error || !product) {
        throw new Error("Prodotto non trovato");
      }

      if (product.stock_quantity !== null && product.stock_quantity < item.quantity) {
        throw new Error("Stock insufficiente per " + product.name);
      }

      const lineTotal = calculateLineTotal(product.price, item.quantity);
      subtotal += lineTotal;

      lineInserts.push({
        pin_size_id: product.pin_size_id,
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
        line_total: lineTotal,
        is_custom: false,
        custom_design_path: null,
        customization_data: null,
      });
    } else {
      hasCustom = true;
      const { data: pinSize, error } = await supabase
        .from("pin_sizes")
        .select("*")
        .eq("id", item.pinSizeId)
        .eq("is_active", true)
        .single();

      if (error || !pinSize) {
        throw new Error("Taglia non valida");
      }

      const unitPrice = getCustomPrice(pinSize);
      const lineTotal = calculateLineTotal(unitPrice, item.quantity);
      subtotal += lineTotal;

      const base64 = item.designBase64.replace(/^data:image\/\w+;base64,/, "");
      const designBuffer = Buffer.from(base64, "base64");
      if (designBuffer.length === 0) {
        throw new Error("Design immagine mancante");
      }

      const designPath = "custom/" + uuidv4() + ".jpg";
      const { error: uploadError } = await supabase.storage
        .from("custom-designs")
        .upload(designPath, designBuffer, { contentType: "image/jpeg" });

      if (uploadError) {
        throw new Error("Errore upload design");
      }

      lineInserts.push({
        pin_size_id: item.pinSizeId,
        product_id: null,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        is_custom: true,
        custom_design_path: designPath,
        customization_data: item.customization,
      });
    }
  }

  const orderType = hasCustom && hasCatalog ? "mixed" : hasCustom ? "custom" : "catalog";
  const shipping = await calculateShippingCost(subtotal, input.shippingMethodId);
  const totalAmount = calculateOrderTotal(subtotal, shipping.cost);

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

  const rows = lineInserts.map((line) => ({
    ...line,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(rows);
  if (itemsError) {
    throw new Error("Errore righe ordine");
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
  };
}
