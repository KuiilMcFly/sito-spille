import { NextRequest, NextResponse } from "next/server";
import { buildOrderLines } from "@/lib/orders/build-cart-lines";
import { applyBestPromotion } from "@/lib/promotions/apply";
import { loadActivePromotions } from "@/lib/promotions/load";
import type { CheckoutItemPayload } from "@/lib/cart/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = body.items as CheckoutItemPayload[];
    const promoCode = body.promoCode as string | undefined;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
    }

    const { lines } = await buildOrderLines(items);
    const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
    const promotions = await loadActivePromotions();
    const applied = applyBestPromotion(
      promotions,
      lines.map((l) => l.promoLine),
      promoCode
    );

    return NextResponse.json({
      subtotal,
      discountAmount: applied.discountAmount,
      subtotalAfterDiscount: applied.subtotalAfterDiscount,
      freeShipping: applied.freeShipping,
      promotionId: applied.promotionId,
      promotionCode: applied.promotionCode,
      promotionName: applied.promotionName,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
