import { Suspense } from "react";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/catalog/product-grid";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import type { ProductWithImages } from "@/types/database";

export const metadata = { title: "Catalogo prodotti" };

type Props = {
  searchParams: Promise<{ q?: string; gruppo?: string; tipologia?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  let products: ProductWithImages[] = [];
  let groups: { id: string; name: string; slug: string }[] = [];
  let typologies: { id: string; name: string; slug: string }[] = [];

  const supabase = await createClientIfConfigured();

  if (supabase) {
    try {
      const [{ data: groupsData }, { data: typologiesData }] = await Promise.all([
        supabase.from("product_groups").select("id, name, slug").eq("is_active", true).order("sort_order"),
        supabase.from("product_typologies").select("id, name, slug").eq("is_active", true).order("sort_order"),
      ]);
      groups = groupsData || [];
      typologies = typologiesData || [];

      let groupId: string | null = null;
      let typologyId: string | null = null;

      if (params.gruppo) {
        const g = groups.find((x) => x.slug === params.gruppo);
        groupId = g?.id || null;
      }
      if (params.tipologia) {
        const t = typologies.find((x) => x.slug === params.tipologia);
        typologyId = t?.id || null;
      }

      let query = supabase
        .from("products")
        .select("*, product_images(*), pin_sizes(*), product_groups(*), product_typologies(*)")
        .eq("is_active", true)
        .order("sort_order");

      if (params.q?.trim()) {
        query = query.ilike("name", "%" + params.q.trim() + "%");
      }
      if (groupId) query = query.eq("product_group_id", groupId);
      if (typologyId) query = query.eq("product_typology_id", typologyId);

      const { data } = await query;
      products = (data as unknown as ProductWithImages[]) || [];
    } catch {
      products = [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-900">Catalogo spille</h1>
      <p className="mt-2 text-ink-700">
        Spille pronte da ordinare oppure vai al customizer per creare la tua.
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense>
          <CatalogFilters groups={groups as never[]} typologies={typologies as never[]} />
        </Suspense>
        <div>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="text-ink-500">Nessun prodotto trovato.</p>
          )}
        </div>
      </div>
    </div>
  );
}
