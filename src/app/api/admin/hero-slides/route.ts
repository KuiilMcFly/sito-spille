import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { parseHeroSlidePayload, validateHeroBackgroundPath } from "@/lib/hero/slide-payload";

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await parseHeroSlidePayload(request);
  if (payload instanceof NextResponse) return payload;

  const backgroundPath = validateHeroBackgroundPath(payload.backgroundPath);
  if (!backgroundPath) {
    return NextResponse.json({ error: "Background obbligatorio" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .insert({
      product_id: payload.productId || null,
      product_group_id: payload.groupId || null,
      product_typology_id: payload.typologyId || null,
      background_path: backgroundPath,
      title_override: payload.titleOverride || null,
      subtitle_override: payload.subtitleOverride || null,
      cta_label: payload.ctaLabel || "Scopri",
      sort_order: parseInt(payload.sortOrder) || 0,
      is_active: payload.isActive,
      product_position: payload.productPosition,
      background_position: payload.backgroundPosition || "50% 50%",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
