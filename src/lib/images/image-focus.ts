export type ImageFrameRatio = "square" | "4/3" | "16/9" | "21/9";

export type ImageTransform = {
  panX: number;
  panY: number;
  scale: number;
};

export function getFrameSize(ratio: ImageFrameRatio): { width: number; height: number } {
  if (ratio === "square") return { width: 1200, height: 1200 };
  if (ratio === "4/3") return { width: 1200, height: 900 };
  if (ratio === "16/9") return { width: 1600, height: 900 };
  return { width: 1680, height: 720 };
}

export function getPreviewAspectClass(ratio: ImageFrameRatio): string {
  if (ratio === "square") return "aspect-square";
  if (ratio === "4/3") return "aspect-[4/3]";
  if (ratio === "16/9") return "aspect-video";
  return "aspect-[21/9]";
}

export function isAnimatedImageType(mimeType: string, fileName: string): boolean {
  if (mimeType === "image/gif") return true;
  const lower = fileName.toLowerCase();
  return lower.endsWith(".gif");
}

export function clampPan(
  panX: number,
  panY: number,
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
  scale: number
): { panX: number; panY: number } {
  const coverScale = Math.max(frameW / imgW, frameH / imgH) * scale;
  const drawW = imgW * coverScale;
  const drawH = imgH * coverScale;
  const minPanX = frameW - drawW;
  const minPanY = frameH - drawH;
  return {
    panX: Math.min(0, Math.max(minPanX, panX)),
    panY: Math.min(0, Math.max(minPanY, panY)),
  };
}

export function getInitialTransform(
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number
): ImageTransform {
  const coverScale = Math.max(frameW / imgW, frameH / imgH);
  const drawW = imgW * coverScale;
  const drawH = imgH * coverScale;
  return {
    panX: (frameW - drawW) / 2,
    panY: (frameH - drawH) / 2,
    scale: 1,
  };
}

export function objectPositionFromTransform(
  transform: ImageTransform,
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number
): string {
  const coverScale = Math.max(frameW / imgW, frameH / imgH) * transform.scale;
  const drawW = imgW * coverScale;
  const drawH = imgH * coverScale;
  const clamped = clampPan(transform.panX, transform.panY, frameW, frameH, imgW, imgH, transform.scale);
  const focusX = ((frameW / 2 - clamped.panX) / drawW) * 100;
  const focusY = ((frameH / 2 - clamped.panY) / drawH) * 100;
  return Math.round(focusX) + "% " + Math.round(focusY) + "%";
}

export async function loadImageElement(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let objectUrl: string | null = null;

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossibile caricare immagine"));
    };

    if (typeof source === "string") {
      img.crossOrigin = "anonymous";
      img.src = source;
      return;
    }

    objectUrl = URL.createObjectURL(source);
    img.src = objectUrl;
  });
}

export async function renderFocusedImageFile(
  img: HTMLImageElement,
  frameW: number,
  frameH: number,
  transform: ImageTransform,
  originalName: string,
  preferPng: boolean
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = frameW;
  canvas.height = frameH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supportato");

  const coverScale = Math.max(frameW / img.width, frameH / img.height) * transform.scale;
  const drawW = img.width * coverScale;
  const drawH = img.height * coverScale;
  const clamped = clampPan(
    transform.panX,
    transform.panY,
    frameW,
    frameH,
    img.width,
    img.height,
    transform.scale
  );

  ctx.drawImage(img, clamped.panX, clamped.panY, drawW, drawH);

  const outputType = preferPng ? "image/png" : "image/jpeg";
  const quality = outputType === "image/jpeg" ? 0.92 : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Errore export immagine"));
          return;
        }
        const ext = outputType === "image/png" ? "png" : "jpg";
        const baseName = originalName.replace(/\.[^.]+$/, "") || "immagine";
        resolve(new File([blob], baseName + "-posizionata." + ext, { type: outputType }));
      },
      outputType,
      quality
    );
  });
}

export async function renderFocusedPreviewDataUrl(
  img: HTMLImageElement,
  frameW: number,
  frameH: number,
  transform: ImageTransform,
  preferPng: boolean
): Promise<string> {
  const file = await renderFocusedImageFile(img, frameW, frameH, transform, "preview", preferPng);
  return URL.createObjectURL(file);
}
