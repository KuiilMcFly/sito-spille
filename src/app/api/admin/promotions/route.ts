import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Enums } from "@/types/database";

type PromotionTargetInput = {
  target_type: Enums<"promotion_target_type">;
  target_id?: string | null;
};

function parsePromotionBody(body: Record<string, unknown>) {
  return {
    name: String(body.name || ""),
    code: body.code ? String(body.code).trim().toUpperCase() : null,
    promotion_type: body.promotion_type as Enums<"promotion_type">,
    is_active: body.is_active !== false,
    starts_at: body.starts_at ? String(body.starts_at) : null,
    ends_at: body.ends_at ? String(body.ends_at) : null,
    priority: parseInt(String(body.priority ?? "0")) || 0,
    usage_limit: body.usage_limit ? parseInt(String(body.usage_limit)) : null,
    min_cart_amount: body.min_cart_amount ? parseFloat(String(body.min_cart_amount)) : null,
    min_quantity: parseInt(String(body.min_quantity ?? "1")) || 1,
    discount_value: parseFloat(String(body.discount_value ?? "0")) || 0,
    bundle_quantity: body.bundle_quantity ? parseInt(String(body.bundle_quantity)) : null,
    requires_code: body.requires_code === true,
    usage_instructions: String(body.usage_instructions || ""),
    admin_notes: body.admin_notes ? String(body.admin_notes) : null,
    targets: (body.targets as PromotionTargetInput[]) || [],
  };
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*, promotion_targets(*)")
    .order("priority", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const payload = parsePromotionBody(body);

  if (!payload.name || !payload.promotion_type || !payload.usage_instructions) {
    return NextResponse.json({ error: "Dati promozione incompleti" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: promo, error } = await supabase
    .from("promotions")
    .insert({
      name: payload.name,
      code: payload.code,
      promotion_type: payload.promotion_type,
      is_active: payload.is_active,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      priority: payload.priority,
      usage_limit: payload.usage_limit,
      min_cart_amount: payload.min_cart_amount,
      min_quantity: payload.min_quantity,
      discount_value: payload.discount_value,
      bundle_quantity: payload.bundle_quantity,
      requires_code: payload.requires_code,
      usage_instructions: payload.usage_instructions,
      admin_notes: payload.admin_notes,
    })
    .select()
    .single();

  if (error || !promo) {
    return NextResponse.json({ error: error?.message || "Errore" }, { status: 500 });
  }

  if (payload.targets.length > 0) {
    const rows = payload.targets.map((t) => ({
      promotion_id: promo.id,
      target_type: t.target_type,
      target_id: t.target_id || null,
    }));
    await supabase.from("promotion_targets").insert(rows);
  }

  return NextResponse.json(promo);
}
