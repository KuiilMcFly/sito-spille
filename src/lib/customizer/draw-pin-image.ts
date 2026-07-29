import type { CustomizationData } from "@/types/database";

export function drawPinImageInCircle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  customization: CustomizationData,
  clipSize: number
) {
  const baseCover = clipSize * 0.92;
  const coverScale = Math.max(baseCover / img.width, baseCover / img.height);
  const drawW = img.width * coverScale * customization.scale;
  const drawH = img.height * coverScale * customization.scale;
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
}
