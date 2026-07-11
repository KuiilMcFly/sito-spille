import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Enums } from "@/types/database";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("admin_profiles").select("role").eq("id", user.id).single();
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

  const update: {
    status?: Enums<"order_status">;
    admin_notes?: string | null;
  } = {};
  if (body.status) update.status = body.status as Enums<"order_status">;
  if (body.admin_notes !== undefined) update.admin_notes = body.admin_notes;

  const { error } = await supabase.from("orders").update(update).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.status) {
    await supabase.from("order_status_history").insert({
      order_id: id,
      to_status: body.status,
      changed_by: admin.id,
      note: body.note || null,
    });
  }

  return NextResponse.json({ ok: true });
}
