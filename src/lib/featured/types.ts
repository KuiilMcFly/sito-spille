import type { ProductWithImages, Tables } from "@/types/database";

export type FeaturedProductItem = {
  kind: "product";
  sortOrder: number;
  product: ProductWithImages;
};

export type FeaturedGroupItem = {
  kind: "group";
  sortOrder: number;
  group: Tables<"product_groups">;
};

export type FeaturedTypologyItem = {
  kind: "typology";
  sortOrder: number;
  typology: Tables<"product_typologies">;
};

export type FeaturedSizeItem = {
  kind: "size";
  sortOrder: number;
  size: Tables<"pin_sizes">;
};

export type FeaturedItem =
  | FeaturedProductItem
  | FeaturedGroupItem
  | FeaturedTypologyItem
  | FeaturedSizeItem;

export function sortFeaturedItems(items: FeaturedItem[]): FeaturedItem[] {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    const nameA =
      a.kind === "product"
        ? a.product.name
        : a.kind === "group"
          ? a.group.name
          : a.kind === "typology"
            ? a.typology.name
            : a.size.name;
    const nameB =
      b.kind === "product"
        ? b.product.name
        : b.kind === "group"
          ? b.group.name
          : b.kind === "typology"
            ? b.typology.name
            : b.size.name;
    return nameA.localeCompare(nameB, "it");
  });
}
