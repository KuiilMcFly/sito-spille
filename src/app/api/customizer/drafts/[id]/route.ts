import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteDraftStorage } from "@/lib/customizer/upload-draft-image";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: draft, error } = await admin
    .from("customizer_drafts")
    .select("*, pin_sizes(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !draft) {
    return NextResponse.json({ error: "Bozza non trovata" }, { status: 404 });
  }

  const { data: signed } = await admin.storage
    .from("custom-designs")
    .createSignedUrl(draft.source_path, 3600);

  return NextResponse.json({
    ...draft,
    sourceUrl: signed?.signedUrl || null,
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: draft } = await admin
    .from("customizer_drafts")
    .select("source_path, preview_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!draft) {
    return NextResponse.json({ error: "Bozza non trovata" }, { status: 404 });
  }

  await deleteDraftStorage([draft.source_path, draft.preview_path || ""]);
  const { error } = await admin.from("customizer_drafts").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
