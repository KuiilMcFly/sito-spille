import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice, getStorageUrl } from "@/lib/utils";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import type { ProductWithImages } from "@/types/database";

export const metadata = { title: "Preferiti" };

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/accedi");

  const admin = createAdminClient();
  const { data } = await admin
    .from("wishlist_items")
    .select("id, product_id, products(*, product_images(*), pin_sizes(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items =
    (data as { id: string; products: ProductWithImages | null }[] | null) || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/account" className="text-sm text-brand-600 hover:underline">
        Torna all account
      </Link>
      <h1 className="font-display mt-4 text-3xl font-bold text-ink-900">Preferiti</h1>

      {items.length === 0 ? (
        <p className="mt-8 text-ink-500">
          Nessun prodotto salvato.{" "}
          <Link href="/prodotti" className="text-brand-600 underline">
            Sfoglia il catalogo
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const product = item.products;
            if (!product) return null;
            const primaryImage = product.product_images?.find((img) => img.is_primary);
            const imageUrl = primaryImage ? getStorageUrl(primaryImage.storage_path) : null;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm"
              >
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
                  <div className="mt-3">
                    <WishlistButton productId={product.id} initialSaved loggedIn />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
