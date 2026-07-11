import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import { createPayPalOrder } from "@/lib/paypal/client";
import { isPayPalConfigured } from "@/lib/paypal/config";
import { areOrdersOpen, ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-open";

export async function POST(request: NextRequest) {
  try {
    if (!(await areOrdersOpen())) {
      return NextResponse.json({ error: ORDERS_CLOSED_MESSAGE }, { status: 403 });
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal non configurato sul server" },
        { status: 503 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Ordine mancante" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
    }

    if (order.status !== "pending_payment") {
      return NextResponse.json(
        { error: "Ordine non pagabile" },
        { status: 400 }
      );
    }

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", order.id)
      .eq("status", "created")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPayment?.paypal_order_id) {
      return NextResponse.json({
        paypalOrderId: existingPayment.paypal_order_id,
        orderNumber: order.order_number,
      });
    }

    const paypalResult = await createPayPalOrder(
      order.total_amount,
      order.currency || "EUR",
      order.order_number
    );

    await supabase.from("payments").insert({
      order_id: order.id,
      provider: "paypal",
      status: "created",
      paypal_order_id: paypalResult.paypalOrderId,
      amount: order.total_amount,
      currency: order.currency || "EUR",
      raw_create_response: paypalResult.raw as Json,
    });

    return NextResponse.json({
      paypalOrderId: paypalResult.paypalOrderId,
      orderNumber: order.order_number,
    });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "Errore creazione pagamento PayPal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
