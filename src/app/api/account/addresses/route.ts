import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("customer_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Accedi per salvare indirizzi" }, { status: 401 });
  }

  const body = await request.json();
  const streetLine1 = String(body.streetLine1 || "").trim();
  const city = String(body.city || "").trim();
  const province = String(body.province || "").trim();
  const postalCode = String(body.postalCode || "").trim();

  if (!streetLine1 || !city || !province || !postalCode) {
    return NextResponse.json({ error: "Compila tutti i campi obbligatori" }, { status: 400 });
  }

  const admin = createAdminClient();
  const isDefault = Boolean(body.isDefault);

  if (isDefault) {
    await admin
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error } = await admin
    .from("customer_addresses")
    .insert({
      user_id: user.id,
      label: String(body.label || "Casa").trim() || "Casa",
      full_name: body.fullName ? String(body.fullName).trim() : null,
      phone: body.phone ? String(body.phone).trim() : null,
      street_line1: streetLine1,
      street_line2: body.streetLine2 ? String(body.streetLine2).trim() : null,
      city,
      province,
      postal_code: postalCode,
      country: String(body.country || "IT").trim() || "IT",
      is_default: isDefault,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Errore salvataggio" }, { status: 500 });
  }

  return NextResponse.json(data);
}
