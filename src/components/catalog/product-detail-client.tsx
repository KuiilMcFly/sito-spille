"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice, getStorageUrl } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";
import { ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-messages";
import type { ProductWithImages } from "@/types/database";
import { Package, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

type ProductDetailProps = {
  product: ProductWithImages;
  ordersOpen?: boolean;
};

export function ProductDetailClient({ product, ordersOpen = true }: ProductDetailProps) {
  const router = useRouter();
  const { addCatalogItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const primaryImage = product.product_images?.find((img) => img.is_primary);
  const imageUrl = primaryImage ? getStorageUrl(primaryImage.storage_path) : undefined;

  function handleAddToCart() {
    if (!ordersOpen) {
      toast.error(ORDERS_CLOSED_MESSAGE);
      return;
    }

    addCatalogItem({
      type: "catalog",
      productId: product.id,
      productName: product.name,
      pinSizeId: product.pin_size_id,
      quantity,
      unitPrice: product.price,
      imageUrl,
    });

    toast.success("Aggiunto al carrello!");
    router.push("/carrello");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-3xl border border-brand-100 bg-brand-50">
        {primaryImage ? (
          <img
            src={imageUrl}
            alt={primaryImage.alt_text || product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <Package className="h-24 w-24" />
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900">{product.name}</h1>
        {product.author && (
          <p className="mt-2 text-ink-500">Artwork di {product.author}</p>
        )}
        {product.pin_sizes && (
          <p className="mt-2 text-ink-400">Taglia: {product.pin_sizes.name}</p>
        )}
        <p className="mt-4 text-3xl font-bold text-brand-600">{formatPrice(product.price)}</p>
        {product.description && <p className="mt-6 text-ink-700">{product.description}</p>}

        <div className="mt-8 space-y-4 rounded-2xl border border-brand-100 bg-white p-6">
          <Input
            label="Quantita"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          />

          {!ordersOpen && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {ORDERS_CLOSED_MESSAGE}
            </div>
          )}

          <Button className="w-full" disabled={!ordersOpen} onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Aggiungi al carrello
          </Button>
        </div>
      </div>
    </div>
  );
}
