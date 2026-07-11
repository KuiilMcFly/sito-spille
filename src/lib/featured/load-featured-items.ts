import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ProductWithImages } from "@/types/database";
import { sortFeaturedItems, type FeaturedItem } from "@/lib/featured/types";

export async function loadFeaturedItems(
  supabase: SupabaseClient<Database>
): Promise<FeaturedItem[]> {
  const [productsRes, groupsRes, typologiesRes, sizesRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(*), pin_sizes(*)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order"),
    supabase
      .from("product_groups")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order"),
    supabase
      .from("product_typologies")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order"),
    supabase
      .from("pin_sizes")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order"),
  ]);

  const items: FeaturedItem[] = [];

  for (const product of (productsRes.data as unknown as ProductWithImages[]) || []) {
    items.push({
      kind: "product",
      sortOrder: product.sort_order,
      product,
    });
  }

  for (const group of groupsRes.data || []) {
    items.push({
      kind: "group",
      sortOrder: group.sort_order,
      group,
    });
  }

  for (const typology of typologiesRes.data || []) {
    items.push({
      kind: "typology",
      sortOrder: typology.sort_order,
      typology,
    });
  }

  for (const size of sizesRes.data || []) {
    items.push({
      kind: "size",
      sortOrder: size.sort_order,
      size,
    });
  }

  return sortFeaturedItems(items);
}
