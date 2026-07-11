import Link from "next/link";
import { notFound } from "next/navigation";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getSiteAssetUrl } from "@/lib/utils";
import type { ProductWithImages } from "@/types/database";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClientIfConfigured();
  if (!supabase) return { title: "Gruppo" };

  const { data: group } = await supabase
    .from("product_groups")
    .select("name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  return { title: group?.name || "Gruppo" };
}

export default async function GroupDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClientIfConfigured();
  if (!supabase) notFound();

  const { data: group } = await supabase
    .from("product_groups")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!group) notFound();

  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), pin_sizes(*)")
    .eq("product_group_id", group.id)
    .eq("is_active", true)
    .order("sort_order");

  const products = (data as unknown as ProductWithImages[]) || [];
  const bgUrl = group.background_path ? getSiteAssetUrl(group.background_path) : null;

  return (
    <div className="relative min-h-[60vh]">
      {bgUrl && (
        <>
          <div
            className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(" + bgUrl + ")" }}
          />
          <div className="pointer-events-none fixed inset-0 -z-10 bg-white/85 backdrop-blur-sm" />
        </>
      )}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <nav className="text-sm text-ink-500">
          <Link href="/gruppi" className="hover:text-brand-600">
            Gruppi
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink-900">{group.name}</span>
        </nav>
        <h1 className="font-display mt-4 text-4xl font-bold text-ink-900">{group.name}</h1>
        {group.description && (
          <p className="mt-2 max-w-2xl text-lg text-ink-700">{group.description}</p>
        )}
        <div className="mt-10">
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="text-ink-500">Nessun prodotto in questo gruppo.</p>
          )}
        </div>
      </div>
    </div>
  );
}
