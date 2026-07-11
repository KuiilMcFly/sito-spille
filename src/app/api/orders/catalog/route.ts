import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  calculateLineTotal,
  calculateOrderTotal,
  calculateShippingCost,
} from "@/lib/orders/pricing";
import { areOrdersOpen, ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-open";

export async function POST(request: NextRequest) {
  try {
    if (!(await areOrdersOpen())) {
      return NextResponse.json({ error: ORDERS_CLOSED_MESSAGE }, { status: 403 });
    }

    const body = await request.json();
    const { productId, quantity = 1, email, phone, name, notes, shippingMethodId } = body;

    if (!productId || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }
    if (!shippingMethodId) {
      return NextResponse.json({ error: "Seleziona un metodo di spedizione" }, { status: 400 });
    }

    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const supabase = createAdminClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
    }

    if (product.stock_quantity !== null && product.stock_quantity < quantity) {
      return NextResponse.json({ error: "Stock insufficiente" }, { status: 400 });
    }

    const lineTotal = calculateLineTotal(product.price, quantity);
    const shipping = await calculateShippingCost(lineTotal, shippingMethodId);
    const totalAmount = calculateOrderTotal(lineTotal, shipping.cost);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: "",
        order_type: "catalog",
        status: "pending_payment",
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        customer_name: name || null,
        customer_notes: notes || null,
        subtotal: lineTotal,
        shipping_cost: shipping.cost,
        total_amount: totalAmount,
        currency: "EUR",
        user_id: user?.id || null,
        shipping_method_id: shippingMethodId,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Errore creazione ordine" }, { status: 500 });
    }

    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: productId,
      pin_size_id: product.pin_size_id,
      quantity,
      unit_price: product.price,
      line_total: lineTotal,
      is_custom: false,
    });

    return NextResponse.json({
      orderNumber: order.order_number,
      orderId: order.id,
    });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
