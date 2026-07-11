import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayPalWebhook } from "@/lib/paypal/client";
import {
  sendAdminNewOrderEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email/send";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers = request.headers;

  const isValid = await verifyPayPalWebhook(headers, body);
  if (!isValid && process.env.PAYPAL_WEBHOOK_ID) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventType = event.event_type;
  const eventId = event.id;

  const supabase = createAdminClient();

  const paypalOrderId =
    event.resource?.supplementary_data?.related_ids?.order_id ||
    event.resource?.id;

  if (!paypalOrderId) {
    return NextResponse.json({ received: true });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("*, orders(*)")
    .eq("paypal_order_id", paypalOrderId)
    .single();

  if (!payment) {
    return NextResponse.json({ received: true });
  }

  const { data: existingEvent } = await supabase
    .from("payment_events")
    .select("id")
    .eq("paypal_event_id", eventId)
    .single();

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await supabase.from("payment_events").insert({
    payment_id: payment.id,
    event_type: eventType,
    paypal_event_id: eventId,
    payload: event,
  });

  if (
    eventType === "PAYMENT.CAPTURE.COMPLETED" ||
    eventType === "CHECKOUT.ORDER.APPROVED"
  ) {
    const capture = event.resource;
    const isCapture = eventType === "PAYMENT.CAPTURE.COMPLETED";

    await supabase
      .from("payments")
      .update({
        status: "captured",
        paypal_capture_id: isCapture ? capture.id : payment.paypal_capture_id,
        payer_email: capture.payer?.email_address || payment.payer_email,
        raw_capture_response: event.resource,
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", payment.order_id);

    const order = payment.orders;
    if (order && order.status !== "paid") {
      await sendOrderConfirmationEmail({
        to: order.customer_email,
        orderNumber: order.order_number,
        total: order.total_amount,
      });
      await sendAdminNewOrderEmail({
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        total: order.total_amount,
      });
    }
  }

  return NextResponse.json({ received: true });
}
