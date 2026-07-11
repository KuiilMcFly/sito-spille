import { NextRequest, NextResponse } from "next/server";
import { parseHeroProductPosition } from "@/lib/hero/constants";
import { isAllowedSiteAssetPath } from "@/lib/images/content-type";

export type HeroSlidePayload = {
  productId: string | null;
  groupId: string | null;
  typologyId: string | null;
  productPosition: string;
  titleOverride: string;
  subtitleOverride: string;
  ctaLabel: string;
  sortOrder: string;
  isActive: boolean;
  backgroundPath?: string;
  backgroundPosition?: string;
};

function normalizeHeroFeatureIds(
  productId: string | null,
  groupId: string | null,
  typologyId: string | null
): Pick<HeroSlidePayload, "productId" | "groupId" | "typologyId"> {
  if (productId) {
    return { productId, groupId: null, typologyId: null };
  }
  if (groupId) {
    return { productId: null, groupId, typologyId: null };
  }
  if (typologyId) {
    return { productId: null, groupId: null, typologyId };
  }
  return { productId: null, groupId: null, typologyId: null };
}

export async function parseHeroSlidePayload(
  request: NextRequest
): Promise<HeroSlidePayload | NextResponse> {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const productId = body.productId ? String(body.productId) : null;
  const groupId = body.groupId ? String(body.groupId) : null;
  const typologyId = body.typologyId ? String(body.typologyId) : null;
  const feature = normalizeHeroFeatureIds(productId, groupId, typologyId);

  return {
    ...feature,
    productPosition: parseHeroProductPosition(body.productPosition),
    titleOverride: String(body.titleOverride || ""),
    subtitleOverride: String(body.subtitleOverride || ""),
    ctaLabel: String(body.ctaLabel || "Scopri"),
    sortOrder: String(body.sortOrder ?? "0"),
    isActive: body.isActive !== false,
    backgroundPath: body.backgroundPath ? String(body.backgroundPath) : undefined,
    backgroundPosition: body.backgroundPosition
      ? String(body.backgroundPosition)
      : "50% 50%",
  };
}

export function validateHeroBackgroundPath(path: string | undefined): string | null {
  if (!path) return null;
  if (!isAllowedSiteAssetPath(path, "hero")) return null;
  return path;
}
