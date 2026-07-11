import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/forms";

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const { data: sizes } = await supabase.from("pin_sizes").select("*").order("sort_order");

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Nuovo prodotto</h1>
      <div className="mt-6">
        <ProductForm sizes={sizes || []} />
      </div>
    </div>
  );
}
