import Link from "next/link";
import { notFound } from "next/navigation";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { ProductWithImages } from "@/types/database";
import { Tags } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClientIfConfigured();
  if (!supabase) return { title: "Tipologia" };

  const { data: typology } = await supabase
    .from("product_typologies")
    .select("name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  return { title: typology?.name || "Tipologia" };
}

export default async function TypologyDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClientIfConfigured();
  if (!supabase) notFound();

  const { data: typology } = await supabase
    .from("product_typologies")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!typology) notFound();

  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), pin_sizes(*)")
    .eq("product_typology_id", typology.id)
    .eq("is_active", true)
    .order("sort_order");

  const products = (data as unknown as ProductWithImages[]) || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <nav className="text-sm text-ink-500">
        <Link href="/tipologie" className="hover:text-brand-600">
          Tipologie
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">{typology.name}</span>
      </nav>
      <div className="mt-4 flex items-start gap-4">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
          <Tags className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900">{typology.name}</h1>
          <p className="mt-2 text-ink-700">
            {products.length} prodott{products.length === 1 ? "o" : "i"} in questa tipologia.
          </p>
        </div>
      </div>
      <div className="mt-10">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <p className="text-ink-500">Nessun prodotto in questa tipologia.</p>
        )}
      </div>
    </div>
  );
}
