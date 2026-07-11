import { notFound } from "next/navigation";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/forms";
import { getStorageUrl } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const [
    { data: product },
    { data: sizes },
    { data: groups },
    { data: typologies },
    { data: images },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("pin_sizes").select("*").order("sort_order"),
    supabase.from("product_groups").select("*").order("sort_order"),
    supabase.from("product_typologies").select("*").order("sort_order"),
    supabase.from("product_images").select("*").eq("product_id", id).eq("is_primary", true),
  ]);

  if (!product) notFound();

  const primary = images?.[0];
  const primaryImageUrl = primary ? getStorageUrl(primary.storage_path) : null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Modifica prodotto</h1>
      <div className="mt-6">
        <ProductForm
          product={product}
          sizes={sizes || []}
          groups={groups || []}
          typologies={typologies || []}
          primaryImageUrl={primaryImageUrl}
        />
      </div>
    </div>
  );
}
