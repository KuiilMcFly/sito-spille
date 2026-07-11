import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  if (body.isDefault) {
    await admin
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error } = await admin
    .from("customer_addresses")
    .update({
      label: body.label ? String(body.label).trim() : undefined,
      full_name: body.fullName !== undefined ? (body.fullName ? String(body.fullName).trim() : null) : undefined,
      phone: body.phone !== undefined ? (body.phone ? String(body.phone).trim() : null) : undefined,
      street_line1: body.streetLine1 ? String(body.streetLine1).trim() : undefined,
      street_line2: body.streetLine2 !== undefined ? (body.streetLine2 ? String(body.streetLine2).trim() : null) : undefined,
      city: body.city ? String(body.city).trim() : undefined,
      province: body.province ? String(body.province).trim() : undefined,
      postal_code: body.postalCode ? String(body.postalCode).trim() : undefined,
      country: body.country ? String(body.country).trim() : undefined,
      is_default: body.isDefault !== undefined ? Boolean(body.isDefault) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Indirizzo non trovato" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("customer_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
