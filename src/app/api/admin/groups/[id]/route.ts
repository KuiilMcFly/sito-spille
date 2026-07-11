import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { uploadSiteAsset } from "@/lib/supabase/upload-site-asset";
import type { TablesUpdate } from "@/types/database";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const coverFile = formData.get("cover") as File | null;
  const backgroundFile = formData.get("background") as File | null;

  const updates: TablesUpdate<"product_groups"> = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || null,
    sort_order: parseInt(formData.get("sortOrder") as string) || 0,
    is_active: formData.get("isActive") === "true",
    updated_at: new Date().toISOString(),
  };

  if (coverFile && coverFile.size > 0) {
    const path = await uploadSiteAsset(coverFile, "groups/covers");
    if (path) updates.cover_path = path;
  }

  if (backgroundFile && backgroundFile.size > 0) {
    const path = await uploadSiteAsset(backgroundFile, "groups/backgrounds");
    if (path) updates.background_path = path;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("product_groups").update(updates).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("product_groups").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
