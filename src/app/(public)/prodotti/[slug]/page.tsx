import { notFound } from "next/navigation";
import { createClientIfConfigured, getServerUser } from "@/lib/supabase/server";
import { getFreeShippingThreshold, getShippingMethods } from "@/lib/orders/pricing";
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
  const user = await getServerUser();

  if (!supabase) {
    notFound();
  }

  const [productResult, shippingMethods, freeShippingThreshold, ordersOpen] =
    await Promise.all([
      supabase
        .from("products")
        .select("*, product_images(*), pin_sizes(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .single(),
      getShippingMethods(),
      getFreeShippingThreshold(),
      areOrdersOpen(),
    ]);

  const product = productResult.data;
  if (!product) notFound();

  let profile = null;
  if (user) {
    try {
      const { data } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = data;
    } catch {
      profile = null;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <ProductDetailClient
        product={product as unknown as ProductWithImages}
        shippingMethods={shippingMethods}
        freeShippingThreshold={freeShippingThreshold}
        ordersOpen={ordersOpen}
        loggedInEmail={user?.email}
        loggedInPhone={profile?.phone}
        loggedInName={profile?.full_name}
      />
    </div>
  );
}
