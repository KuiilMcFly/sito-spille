import { createAdminClient } from "@/lib/supabase/admin";
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

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = folder + "/" + uuidv4() + "." + ext;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "image/jpeg";

  const { error } = await supabase.storage.from("site-assets").upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, path };
}
