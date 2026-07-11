import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadDraftImages } from "@/lib/customizer/upload-draft-image";
import type { CustomizationData } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("customizer_drafts")
    .select("*, pin_sizes(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const drafts = await Promise.all(
    (data || []).map(async (draft) => {
      let previewUrl: string | null = null;
      const path = draft.preview_path || draft.source_path;
      if (path) {
        const { data: signed } = await admin.storage
          .from("custom-designs")
          .createSignedUrl(path, 3600);
        previewUrl = signed?.signedUrl || null;
      }
      return { ...draft, previewUrl };
    })
  );

  return NextResponse.json(drafts);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Accedi per salvare le bozze" }, { status: 401 });
  }

  const body = await request.json();
  const pinSizeId = String(body.pinSizeId || "");
  const sourceBase64 = String(body.sourceBase64 || "");
  const previewBase64 = body.previewBase64 ? String(body.previewBase64) : null;
  const name = body.name ? String(body.name).trim() : null;
  const customization = body.customization as CustomizationData;

  if (!pinSizeId || !sourceBase64 || !customization) {
    return NextResponse.json({ error: "Dati bozza incompleti" }, { status: 400 });
  }

  try {
    const { sourcePath, previewPath } = await uploadDraftImages({
      userId: user.id,
      sourceBase64,
      previewBase64,
    });

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("customizer_drafts")
      .insert({
        user_id: user.id,
        pin_size_id: pinSizeId,
        name,
        source_path: sourcePath,
        preview_path: previewPath,
        customization_data: customization,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Errore salvataggio" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
