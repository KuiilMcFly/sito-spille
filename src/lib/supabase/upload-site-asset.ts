import { createAdminClient } from "@/lib/supabase/admin";
import { resolveImageContentType, resolveImageExtension } from "@/lib/images/content-type";
import { v4 as uuidv4 } from "uuid";

export type UploadSiteAssetResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

export async function uploadSiteAsset(
  file: File,
  folder: string
): Promise<UploadSiteAssetResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "File vuoto" };
  }

  const contentType = resolveImageContentType(file.name, file.type);
  if (!contentType.startsWith("image/")) {
    return { ok: false, error: "Formato file non supportato" };
  }

  const supabase = createAdminClient();
  const ext = resolveImageExtension(file.name, contentType);
  const path = folder + "/" + uuidv4() + "." + ext;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("site-assets").upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, path };
}
