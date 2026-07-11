import { v4 as uuidv4 } from "uuid";
import { createAdminClient } from "@/lib/supabase/admin";

function decodeBase64Image(dataUrl: string): Buffer {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) {
    throw new Error("Immagine non valida");
  }
  return buffer;
}

export async function uploadDraftImages(input: {
  userId: string;
  sourceBase64: string;
  previewBase64?: string | null;
}) {
  const supabase = createAdminClient();
  const folder = "drafts/" + input.userId + "/" + uuidv4();
  const sourcePath = folder + "/source.jpg";
  const sourceBuffer = decodeBase64Image(input.sourceBase64);

  const { error: sourceError } = await supabase.storage
    .from("custom-designs")
    .upload(sourcePath, sourceBuffer, { contentType: "image/jpeg", upsert: false });

  if (sourceError) {
    throw new Error("Errore upload bozza");
  }

  let previewPath: string | null = null;
  if (input.previewBase64) {
    previewPath = folder + "/preview.jpg";
    const previewBuffer = decodeBase64Image(input.previewBase64);
    const { error: previewError } = await supabase.storage
      .from("custom-designs")
      .upload(previewPath, previewBuffer, { contentType: "image/jpeg", upsert: false });
    if (previewError) {
      previewPath = null;
    }
  }

  return { sourcePath, previewPath };
}

export async function deleteDraftStorage(paths: string[]) {
  const supabase = createAdminClient();
  const valid = paths.filter(Boolean);
  if (valid.length === 0) return;
  await supabase.storage.from("custom-designs").remove(valid);
}
