import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { parseHeroSlidePayload, validateHeroBackgroundPath } from "@/lib/hero/slide-payload";
import type { TablesUpdate } from "@/types/database";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payload = await parseHeroSlidePayload(request);
  if (payload instanceof NextResponse) return payload;

  if (!payload.productId) {
    return NextResponse.json({ error: "Seleziona un prodotto" }, { status: 400 });
  }

  const updates: TablesUpdate<"hero_slides"> = {
    product_id: payload.productId,
    title_override: payload.titleOverride || null,
    subtitle_override: payload.subtitleOverride || null,
    cta_label: payload.ctaLabel || "Scopri",
    sort_order: parseInt(payload.sortOrder) || 0,
    is_active: payload.isActive,
    product_position: payload.productPosition,
    updated_at: new Date().toISOString(),
  };

  const backgroundPath = validateHeroBackgroundPath(payload.backgroundPath);
  if (backgroundPath) {
    updates.background_path = backgroundPath;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("hero_slides").update(updates).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
