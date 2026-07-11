import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { uploadSiteAsset } from "@/lib/supabase/upload-site-asset";

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const backgroundFile = formData.get("background") as File | null;

  if (!backgroundFile || backgroundFile.size === 0) {
    return NextResponse.json({ error: "Background obbligatorio" }, { status: 400 });
  }

  const backgroundPath = await uploadSiteAsset(backgroundFile, "hero");
  if (!backgroundPath) {
    return NextResponse.json({ error: "Errore upload" }, { status: 500 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .insert({
      product_id: formData.get("productId") as string,
      background_path: backgroundPath,
      title_override: (formData.get("titleOverride") as string) || null,
      subtitle_override: (formData.get("subtitleOverride") as string) || null,
      cta_label: (formData.get("ctaLabel") as string) || "Scopri",
      sort_order: parseInt(formData.get("sortOrder") as string) || 0,
      is_active: formData.get("isActive") === "true",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
