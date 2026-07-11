import type { Tables } from "@/types/database";

type HeroSlideListRow = Tables<"hero_slides"> & {
  products: { name?: string } | null;
  product_groups: { name?: string } | null;
  product_typologies: { name?: string } | null;
};

export function getHeroSlideFeatureLabel(slide: HeroSlideListRow): string {
  if (slide.products?.name) return "Prodotto: " + slide.products.name;
  if (slide.product_groups?.name) return "Gruppo: " + slide.product_groups.name;
  if (slide.product_typologies?.name) return "Tipologia: " + slide.product_typologies.name;
  return "Solo sfondo";
}
