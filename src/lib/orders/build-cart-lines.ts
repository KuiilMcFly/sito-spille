import { v4 as uuidv4 } from "uuid";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateLineTotal, getCustomPrice } from "@/lib/orders/pricing";
import type { CheckoutItemPayload } from "@/lib/cart/types";
import type { PromoCartLine } from "@/lib/promotions/types";
import type { CustomizationData, Enums } from "@/types/database";

export type BuiltOrderLine = {
  pin_size_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  is_custom: boolean;
  custom_design_path: string | null;
  customization_data: CustomizationData | null;
  promoLine: PromoCartLine;
};

export async function buildOrderLines(items: CheckoutItemPayload[]) {
  const supabase = createAdminClient();
  const lines: BuiltOrderLine[] = [];
  let hasCustom = false;
  let hasCatalog = false;

  for (const item of items) {
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

      lines.push({
        pin_size_id: product.pin_size_id,
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
        line_total: lineTotal,
        is_custom: false,
        custom_design_path: null,
        customization_data: null,
        promoLine: {
          productId: product.id,
          productGroupId: product.product_group_id,
          productTypologyId: product.product_typology_id,
          quantity: item.quantity,
          lineTotal,
          isCustom: false,
        },
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

      lines.push({
        pin_size_id: item.pinSizeId,
        product_id: null,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        is_custom: true,
        custom_design_path: designPath,
        customization_data: item.customization,
        promoLine: {
          productId: null,
          productGroupId: null,
          productTypologyId: null,
          quantity: item.quantity,
          lineTotal,
          isCustom: true,
        },
      });
    }
  }

  const orderType: Enums<"order_type"> =
    hasCustom && hasCatalog ? "mixed" : hasCustom ? "custom" : "catalog";

  return { lines, orderType };
}
