import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("orderNumber");
  const email = request.nextUrl.searchParams.get("email");

  if (!orderNumber || !email) {
    return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("order_number, status, total_amount, created_at, customer_email")
    .eq("order_number", orderNumber)
    .eq("customer_email", email.toLowerCase())
    .single();

  if (!order) {
    return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
