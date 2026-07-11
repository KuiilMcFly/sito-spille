import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusEmail } from "@/lib/email/send";
import type { Enums, TablesUpdate } from "@/types/database";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const { data: currentOrder } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!currentOrder) {
    return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
  }

  const update: TablesUpdate<"orders"> = {
    updated_at: new Date().toISOString(),
  };

  if (body.status) update.status = body.status as Enums<"order_status">;
  if (body.admin_notes !== undefined) update.admin_notes = body.admin_notes;
  if (body.tracking_number !== undefined) update.tracking_number = body.tracking_number;
  if (body.tracking_url !== undefined) update.tracking_url = body.tracking_url;

  const { error } = await supabase.from("orders").update(update).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.status && body.status !== currentOrder.status) {
    await supabase.from("order_status_history").insert({
      order_id: id,
      from_status: currentOrder.status,
      to_status: body.status,
      changed_by: admin.id,
      note: body.note || null,
    });

    if (body.notify_customer !== false) {
      await sendOrderStatusEmail({
        to: currentOrder.customer_email,
        orderNumber: currentOrder.order_number,
        status: body.status as Enums<"order_status">,
        trackingNumber: body.tracking_number ?? currentOrder.tracking_number,
        trackingUrl: body.tracking_url ?? currentOrder.tracking_url,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
