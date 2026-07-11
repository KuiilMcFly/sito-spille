import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import {
  resolveImageContentType,
  resolveImageExtension,
  SITE_ASSET_MAX_BYTES,
  formatSiteAssetMaxSize,
} from "@/lib/images/content-type";

const ALLOWED_FOLDERS = new Set([
  "hero",
  "logo",
  "groups/covers",
  "groups/backgrounds",
]);

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const folder = String(body.folder || "");
  const fileName = String(body.fileName || "");
  const fileSize = Number(body.fileSize) || 0;

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Cartella upload non valida" }, { status: 400 });
  }

  if (!fileName) {
    return NextResponse.json({ error: "Nome file mancante" }, { status: 400 });
  }

  if (fileSize <= 0) {
    return NextResponse.json({ error: "File vuoto" }, { status: 400 });
  }

  if (fileSize > SITE_ASSET_MAX_BYTES) {
    return NextResponse.json(
      { error: "File troppo grande. Massimo " + formatSiteAssetMaxSize() },
      { status: 400 }
    );
  }

  const contentType = resolveImageContentType(fileName, String(body.contentType || ""));
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Formato file non supportato" }, { status: 400 });
  }

  const ext = resolveImageExtension(fileName, contentType);
  const path = folder + "/" + uuidv4() + "." + ext;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from("site-assets").createSignedUploadUrl(path);

  if (error || !data?.token) {
    return NextResponse.json(
      { error: error?.message || "Impossibile creare URL di upload" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    path,
    token: data.token,
    signedUrl: data.signedUrl,
  });
}
