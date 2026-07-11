import { NextRequest, NextResponse } from "next/server";
import { parseHeroProductPosition } from "@/lib/hero/constants";
import { isAllowedSiteAssetPath } from "@/lib/images/content-type";

export type HeroSlidePayload = {
  productId: string;
  productPosition: string;
  titleOverride: string;
  subtitleOverride: string;
  ctaLabel: string;
  sortOrder: string;
  isActive: boolean;
  backgroundPath?: string;
};

export async function parseHeroSlidePayload(
  request: NextRequest
): Promise<HeroSlidePayload | NextResponse> {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  return {
    productId: String(body.productId || ""),
    productPosition: parseHeroProductPosition(body.productPosition),
    titleOverride: String(body.titleOverride || ""),
    subtitleOverride: String(body.subtitleOverride || ""),
    ctaLabel: String(body.ctaLabel || "Scopri"),
    sortOrder: String(body.sortOrder ?? "0"),
    isActive: body.isActive !== false,
    backgroundPath: body.backgroundPath ? String(body.backgroundPath) : undefined,
  };
}

export function validateHeroBackgroundPath(path: string | undefined): string | null {
  if (!path) return null;
  if (!isAllowedSiteAssetPath(path, "hero")) return null;
  return path;
}
