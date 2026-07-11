import { ProductCard } from "@/components/catalog/product-card";
import type { ProductWithImages } from "@/types/database";

type ProductGridProps = {
  products: ProductWithImages[];
  emptyMessage?: string;
};

export function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-ink-400">
        {emptyMessage || "Nessun prodotto disponibile."}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
