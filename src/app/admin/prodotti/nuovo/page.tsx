import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/forms";

export default async function NewProductPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const [{ data: sizes }, { data: groups }, { data: typologies }] = await Promise.all([
    supabase.from("pin_sizes").select("*").order("sort_order"),
    supabase.from("product_groups").select("*").order("sort_order"),
    supabase.from("product_typologies").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Nuovo prodotto</h1>
      <div className="mt-6">
        <ProductForm
          sizes={sizes || []}
          groups={groups || []}
          typologies={typologies || []}
        />
      </div>
    </div>
  );
}
