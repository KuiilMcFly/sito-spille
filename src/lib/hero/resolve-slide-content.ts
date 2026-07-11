import { formatPrice, getSiteAssetUrl, getStorageUrl } from "@/lib/utils";
import type { HeroSlideWithRelations } from "@/types/database";

export type HeroSlideContent = {
  kind: "product" | "group" | "typology" | null;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  href: string;
  priceLabel: string | null;
};

export function resolveHeroSlideContent(slide: HeroSlideWithRelations): HeroSlideContent {
  const product = slide.products;
  const group = slide.product_groups;
  const typology = slide.product_typologies;

  if (product) {
    const primaryImage = product.product_images?.find((img) => img.is_primary);
    return {
      kind: "product",
      title: slide.title_override || product.name,
      subtitle: slide.subtitle_override || product.description || "",
      imageUrl: primaryImage ? getStorageUrl(primaryImage.storage_path) : null,
      href: "/prodotti/" + product.slug,
      priceLabel: formatPrice(product.price),
    };
  }

  if (group) {
    return {
      kind: "group",
      title: slide.title_override || group.name,
      subtitle: slide.subtitle_override || group.description || "",
      imageUrl: group.cover_path ? getSiteAssetUrl(group.cover_path) : null,
      href: "/gruppi/" + group.slug,
      priceLabel: null,
    };
  }

  if (typology) {
    return {
      kind: "typology",
      title: slide.title_override || typology.name,
      subtitle: slide.subtitle_override || "",
      imageUrl: null,
      href: "/tipologie/" + typology.slug,
      priceLabel: null,
    };
  }

  return {
    kind: null,
    title: slide.title_override || "",
    subtitle: slide.subtitle_override || "",
    imageUrl: null,
    href: "/prodotti",
    priceLabel: null,
  };
}
