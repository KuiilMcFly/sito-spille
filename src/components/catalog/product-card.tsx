import Link from "next/link";
import { formatPrice, getStorageUrl } from "@/lib/utils";
import type { ProductWithImages } from "@/types/database";
import { Package } from "lucide-react";

type ProductCardProps = {
  product: ProductWithImages;
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.product_images?.find((img) => img.is_primary);
  const imagePath = primaryImage?.storage_path;

  return (
    <Link
      href={"/prodotti/" + product.slug}
      className="card-hover-lift group overflow-hidden rounded-3xl border border-brand-100 bg-white"
    >
      <div className="relative aspect-square bg-brand-50">
        {imagePath ? (
          <img
            src={getStorageUrl(imagePath)}
            alt={primaryImage?.alt_text || product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <Package className="h-16 w-16" />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
            In evidenza
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-ink-900">
          {product.name}
        </h3>
        {product.pin_sizes && (
          <p className="mt-1 text-sm text-ink-400">
            {product.pin_sizes.name}
          </p>
        )}
        <p className="mt-3 text-xl font-bold text-brand-600">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
