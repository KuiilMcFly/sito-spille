import { createClient } from "@/lib/supabase/client";
import {
  formatSiteAssetMaxSize,
  isAllowedSiteAssetPath,
  resolveImageContentType,
  SITE_ASSET_MAX_BYTES,
} from "@/lib/images/content-type";

export type ClientUploadResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

export async function uploadSiteAssetClient(
  file: File,
  folder: string
): Promise<ClientUploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "File vuoto" };
  }

  if (file.size > SITE_ASSET_MAX_BYTES) {
    return { ok: false, error: "File troppo grande. Massimo " + formatSiteAssetMaxSize() };
  }

  const contentType = resolveImageContentType(file.name, file.type);
  if (!contentType.startsWith("image/")) {
    return { ok: false, error: "Formato file non supportato" };
  }

  const prepRes = await fetch("/api/admin/site-assets/signed-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder,
      fileName: file.name,
      contentType,
      fileSize: file.size,
    }),
  });

  const prep = await prepRes.json().catch(() => ({}));
  if (!prepRes.ok) {
    return { ok: false, error: prep.error || "Errore preparazione upload" };
  }

  if (!isAllowedSiteAssetPath(prep.path, folder)) {
    return { ok: false, error: "Percorso upload non valido" };
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("site-assets")
    .uploadToSignedUrl(prep.path, prep.token, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, path: prep.path };
}
