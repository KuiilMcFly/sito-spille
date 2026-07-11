import { notFound } from "next/navigation";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/forms";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const [{ data: product }, { data: sizes }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("pin_sizes").select("*").order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Modifica prodotto</h1>
      <div className="mt-6">
        <ProductForm product={product} sizes={sizes || []} />
      </div>
    </div>
  );
}
