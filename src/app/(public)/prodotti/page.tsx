import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { ProductWithImages } from "@/types/database";

export const metadata = {
  title: "Catalogo prodotti",
};

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*), pin_sizes(*)")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-900">
        Catalogo spille
      </h1>
      <p className="mt-2 text-ink-700">
        Spille pronte da ordinare oppure vai al customizer per creare la tua.
      </p>
      <div className="mt-10">
        <ProductGrid products={(products as unknown as ProductWithImages[]) || []} />
      </div>
    </div>
  );
}
