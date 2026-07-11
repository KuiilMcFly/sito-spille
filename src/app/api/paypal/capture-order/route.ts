import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { capturePayPalOrder } from "@/lib/paypal/client";
import {
  sendAdminNewOrderEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email/send";

export async function POST(request: NextRequest) {
  try {
    const { paypalOrderId } = await request.json();

    if (!paypalOrderId) {
      return NextResponse.json({ error: "ID PayPal mancante" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: payment } = await supabase
      .from("payments")
      .select("*, orders(*)")
      .eq("paypal_order_id", paypalOrderId)
      .single();

    if (!payment) {
      return NextResponse.json({ error: "Pagamento non trovato" }, { status: 404 });
    }

    if (payment.status === "captured") {
      return NextResponse.json({
        orderNumber: payment.orders?.order_number,
        status: "captured",
      });
    }

    const captureData = await capturePayPalOrder(paypalOrderId);
    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = captureData.payer;

    await supabase
      .from("payments")
      .update({
        status: "captured",
        paypal_capture_id: capture?.id || null,
        paypal_payer_id: payer?.payer_id || null,
        payer_email: payer?.email_address || null,
        payer_name:
          (payer?.name?.given_name || "") +
          " " +
          (payer?.name?.surname || ""),
        fee_amount: parseFloat(capture?.seller_receivable_breakdown?.paypal_fee?.value || "0"),
        raw_capture_response: captureData,
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", payment.order_id);

    const order = payment.orders;
    if (order) {
      await sendOrderConfirmationEmail({
        to: order.customer_email,
        orderNumber: order.order_number,
        total: order.total_amount,
        discountAmount: order.discount_amount || 0,
        promotionName: order.promotion_code,
      });
      await sendAdminNewOrderEmail({
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        total: order.total_amount,
      });
    }

    return NextResponse.json({
      orderNumber: order?.order_number,
      status: "captured",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Errore capture" }, { status: 500 });
  }
}
