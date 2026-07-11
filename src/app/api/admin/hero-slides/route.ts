import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { uploadSiteAsset } from "@/lib/supabase/upload-site-asset";
import { parseHeroProductPosition } from "@/lib/hero/constants";

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const productId = (formData.get("productId") as string) || "";
  const backgroundFile = formData.get("background") as File | null;

  if (!productId) {
    return NextResponse.json({ error: "Seleziona un prodotto" }, { status: 400 });
  }

  if (!backgroundFile || backgroundFile.size === 0) {
    return NextResponse.json({ error: "Background obbligatorio" }, { status: 400 });
  }

  const upload = await uploadSiteAsset(backgroundFile, "hero");
  if (!upload.ok) {
    return NextResponse.json({ error: "Upload background: " + upload.error }, { status: 500 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .insert({
      product_id: productId,
      background_path: upload.path,
      title_override: (formData.get("titleOverride") as string) || null,
      subtitle_override: (formData.get("subtitleOverride") as string) || null,
      cta_label: (formData.get("ctaLabel") as string) || "Scopri",
      sort_order: parseInt(formData.get("sortOrder") as string) || 0,
      is_active: formData.get("isActive") === "true",
      product_position: parseHeroProductPosition(formData.get("productPosition") as string),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
