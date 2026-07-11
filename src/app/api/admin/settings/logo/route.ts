import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { uploadSiteAsset } from "@/lib/supabase/upload-site-asset";

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const logo = formData.get("logo") as File | null;

  if (!logo || logo.size === 0) {
    return NextResponse.json({ error: "File logo mancante" }, { status: 400 });
  }

  const upload = await uploadSiteAsset(logo, "logo");
  if (!upload.ok) {
    return NextResponse.json({ error: "Errore upload logo: " + upload.error }, { status: 500 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert({
    key: "store_logo",
    value: { path: upload.path },
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ path: upload.path });
}

export async function DELETE() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert({
    key: "store_logo",
    value: { path: null },
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
