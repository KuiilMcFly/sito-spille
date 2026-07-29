import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  calculateLineTotal,
  calculateOrderTotal,
  getCustomPrice,
} from "@/lib/orders/pricing";
import {
  maybeSaveCheckoutAddress,
  resolveCheckoutShippingAddress,
} from "@/lib/addresses/resolve-checkout-address";
import type { ShippingAddressPayload } from "@/lib/addresses/types";
import { v4 as uuidv4 } from "uuid";
import { areOrdersOpen, ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-open";

export async function POST(request: NextRequest) {
  try {
    if (!(await areOrdersOpen())) {
      return NextResponse.json({ error: ORDERS_CLOSED_MESSAGE }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    let pinSizeId = "";
    let quantity = 1;
    let email = "";
    let phone = "";
    let customerName: string | null = null;
    let notes: string | null = null;
    let customizationRaw = "{}";
    let designBuffer: Buffer | null = null;
    let userId: string | null = null;
    let shippingAddress: ShippingAddressPayload | null = null;
    let shippingAddressId: string | null = null;
    let saveAddress = false;

    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (user) {
      userId = user.id;
      if (!email) email = user.email || "";
    }

    if (contentType.includes("application/json")) {
      const body = await request.json();
      pinSizeId = body.pinSizeId || "";
      quantity = parseInt(body.quantity) || 1;
      email = body.email || email;
      phone = body.phone || "";
      customerName = body.name || null;
      notes = body.notes || null;
      customizationRaw = body.customization || "{}";
      shippingAddress = body.shippingAddress || null;
      shippingAddressId = body.shippingAddressId || null;
      saveAddress = Boolean(body.saveAddress);

      if (body.designBase64) {
        const base64 = body.designBase64.replace(/^data:image\/\w+;base64,/, "");
        designBuffer = Buffer.from(base64, "base64");
      }
    } else {
      const formData = await request.formData();
      pinSizeId = (formData.get("pinSizeId") as string) || "";
      quantity = parseInt(formData.get("quantity") as string) || 1;
      email = (formData.get("email") as string) || email;
      phone = (formData.get("phone") as string) || "";
      customerName = (formData.get("name") as string) || null;
      notes = (formData.get("notes") as string) || null;
      customizationRaw = (formData.get("customization") as string) || "{}";

      const designEntry = formData.get("design");
      if (designEntry instanceof Blob && designEntry.size > 0) {
        designBuffer = Buffer.from(await designEntry.arrayBuffer());
      }
    }

    if (!designBuffer || designBuffer.length === 0) {
      return NextResponse.json({ error: "Immagine design mancante" }, { status: 400 });
    }
    if (!pinSizeId) {
      return NextResponse.json({ error: "Seleziona una taglia" }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email obbligatoria" }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: "Telefono obbligatorio" }, { status: 400 });
    }

    const shippingAddressJson = await resolveCheckoutShippingAddress({
      userId,
      addressId: shippingAddressId,
      shippingAddress,
    });

    if (!shippingAddressJson) {
      return NextResponse.json({ error: "Indirizzo di spedizione obbligatorio" }, { status: 400 });
    }

    await maybeSaveCheckoutAddress({
      userId,
      saveAddress,
      shippingAddress,
    });

    const supabase = createAdminClient();

    const { data: pinSize, error: sizeError } = await supabase
      .from("pin_sizes")
      .select("*")
      .eq("id", pinSizeId)
      .eq("is_active", true)
      .single();

    if (sizeError || !pinSize) {
      return NextResponse.json({ error: "Taglia non valida" }, { status: 400 });
    }

    const unitPrice = getCustomPrice(pinSize);
    const lineTotal = calculateLineTotal(unitPrice, quantity);
    const shippingCost = 0;
    const totalAmount = calculateOrderTotal(lineTotal, shippingCost);

    const designPath = "custom/" + uuidv4() + ".jpg";

    const { error: uploadError } = await supabase.storage
      .from("custom-designs")
      .upload(designPath, designBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Errore upload design" }, { status: 500 });
    }

    let customizationData = {};
    try {
      customizationData = JSON.parse(customizationRaw || "{}");
    } catch {
      customizationData = {};
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: "",
        order_type: "custom",
        status: "accepted",
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        customer_name: customerName,
        customer_notes: notes,
        subtotal: lineTotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        currency: "EUR",
        user_id: userId,
        shipping_method_id: null,
        shipping_address: shippingAddressJson,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Errore creazione ordine" }, { status: 500 });
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      pin_size_id: pinSizeId,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      is_custom: true,
      custom_design_path: designPath,
      customization_data: customizationData,
    });

    if (itemError) {
      return NextResponse.json({ error: "Errore riga ordine" }, { status: 500 });
    }

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      from_status: null,
      to_status: "accepted",
      note: "Ordine personalizzato ricevuto",
    });

    return NextResponse.json({
      orderNumber: order.order_number,
      orderId: order.id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
