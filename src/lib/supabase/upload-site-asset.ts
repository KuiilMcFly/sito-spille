import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

export async function uploadSiteAsset(
  file: File,
  folder: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = folder + "/" + uuidv4() + "." + ext;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("site-assets").upload(path, buffer, {
    contentType: file.type,
  });

  if (error) return null;
  return path;
}
