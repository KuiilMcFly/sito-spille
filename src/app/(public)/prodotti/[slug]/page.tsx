import { notFound } from "next/navigation";
import { getPublicReadClient } from "@/lib/supabase/public-read";
import { getServerUser } from "@/lib/supabase/server";
import { areOrdersOpen } from "@/lib/orders/orders-open";
import { getStorageUrl } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/metadata/page-metadata";
import { ProductDetailClient } from "@/components/catalog/product-detail-client";
import type { ProductWithImages } from "@/types/database";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await getPublicReadClient();

  if (!supabase) {
    return { title: "Prodotto" };
  }

  try {
    const { data: product } = await supabase
      .from("products")
      .select("name, slug, seo_title, seo_description, product_images(*)")
      .eq("slug", slug)
      .single();

    if (!product) return { title: "Prodotto non trovato" };

    const primaryImage = product.product_images?.find((img) => img.is_primary);
    const imageUrl = primaryImage ? getStorageUrl(primaryImage.storage_path) : null;
    const title = product.seo_title || product.name;
    const description = product.seo_description || product.name;

    return buildPageMetadata({
      title,
      description,
      path: "/prodotti/" + product.slug,
      imageUrl,
      type: "website",
    });
  } catch {
    return { title: "Prodotto" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await getPublicReadClient();

  if (!supabase) {
    notFound();
  }

  const [productResult, ordersOpen, user] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(*), pin_sizes(*), product_groups(*), product_typologies(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single(),
    areOrdersOpen(),
    getServerUser(),
  ]);

  const product = productResult.data;
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <ProductDetailClient
        product={product as unknown as ProductWithImages}
        ordersOpen={ordersOpen}
        loggedIn={Boolean(user)}
        shareUrl={getSiteUrl() + "/prodotti/" + product.slug}
      />
    </div>
  );
}
