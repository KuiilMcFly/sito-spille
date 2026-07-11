import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { formatPrice, getStorageUrl } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/metadata/page-metadata";
import type { ProductWithImages } from "@/types/database";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  return buildPageMetadata({
    title: "Lista preferiti condivisa",
    description: "Scopri i prodotti salvati in questa lista preferiti.",
    path: "/condividi/preferiti/" + token,
  });
}

export default async function SharedWishlistPage({ params }: Props) {
  const { token } = await params;
  const supabase = createAdminClientIfConfigured();
  if (!supabase) notFound();

  const { data: share } = await supabase
    .from("wishlist_shares")
    .select("user_id")
    .eq("share_token", token)
    .single();

  if (!share) notFound();

  const { data } = await supabase
    .from("wishlist_items")
    .select("id, products(*, product_images(*), pin_sizes(*))")
    .eq("user_id", share.user_id)
    .order("created_at", { ascending: false });

  const items = (data as { id: string; products: ProductWithImages | null }[] | null) || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-ink-900">Lista preferiti condivisa</h1>
      <p className="mt-2 text-ink-600">Prodotti selezionati da un cliente del negozio.</p>

      {items.length === 0 ? (
        <p className="mt-8 text-ink-500">Questa lista e vuota al momento.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const product = item.products;
            if (!product) return null;
            const primaryImage = product.product_images?.find((img) => img.is_primary);
            const imageUrl = primaryImage ? getStorageUrl(primaryImage.storage_path) : null;
            return (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
                <Link href={"/prodotti/" + product.slug}>
                  <div className="aspect-square bg-brand-50">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={"/prodotti/" + product.slug}>
                    <h2 className="font-semibold text-ink-900">{product.name}</h2>
                  </Link>
                  <p className="mt-1 text-brand-600">{formatPrice(product.price)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/prodotti" className="btn-primary inline-block">
          Sfoglia catalogo
        </Link>
      </div>
    </div>
  );
}
