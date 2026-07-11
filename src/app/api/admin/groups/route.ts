import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { uploadSiteAsset } from "@/lib/supabase/upload-site-asset";

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const isActive = formData.get("isActive") === "true";
  const coverFile = formData.get("cover") as File | null;
  const backgroundFile = formData.get("background") as File | null;

  const coverPath = coverFile ? await uploadSiteAsset(coverFile, "groups/covers") : null;
  const backgroundPath = backgroundFile
    ? await uploadSiteAsset(backgroundFile, "groups/backgrounds")
    : null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_groups")
    .insert({
      name,
      slug,
      description,
      cover_path: coverPath,
      background_path: backgroundPath,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
