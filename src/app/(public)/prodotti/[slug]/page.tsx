import { notFound } from "next/navigation";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { areOrdersOpen } from "@/lib/orders/orders-open";
import { ProductDetailClient } from "@/components/catalog/product-detail-client";
import type { ProductWithImages } from "@/types/database";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClientIfConfigured();

  if (!supabase) {
    return { title: "Prodotto" };
  }

  try {
    const { data: product } = await supabase
      .from("products")
      .select("name, seo_title, seo_description")
      .eq("slug", slug)
      .single();

    if (!product) return { title: "Prodotto non trovato" };

    return {
      title: product.seo_title || product.name,
      description: product.seo_description || product.name,
    };
  } catch {
    return { title: "Prodotto" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClientIfConfigured();

  if (!supabase) {
    notFound();
  }

  const [productResult, ordersOpen] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(*), pin_sizes(*), product_groups(*), product_typologies(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single(),
    areOrdersOpen(),
  ]);

  const product = productResult.data;
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <ProductDetailClient
        product={product as unknown as ProductWithImages}
        ordersOpen={ordersOpen}
      />
    </div>
  );
}
