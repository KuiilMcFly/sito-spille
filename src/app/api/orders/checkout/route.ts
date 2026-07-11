import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMultiItemOrder } from "@/lib/orders/create-order";
import { areOrdersOpen, ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-open";
import type { CheckoutItemPayload } from "@/lib/cart/types";

export async function POST(request: NextRequest) {
  try {
    if (!(await areOrdersOpen())) {
      return NextResponse.json({ error: ORDERS_CLOSED_MESSAGE }, { status: 403 });
    }

    const body = await request.json();
    const { items, email, phone, name, notes, shippingMethodId } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
    }
    if (!email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Email e telefono obbligatori" }, { status: 400 });
    }
    if (!shippingMethodId) {
      return NextResponse.json({ error: "Seleziona spedizione" }, { status: 400 });
    }

    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    const result = await createMultiItemOrder({
      items: items as CheckoutItemPayload[],
      email,
      phone,
      name,
      notes,
      shippingMethodId,
      userId: user?.id || null,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
