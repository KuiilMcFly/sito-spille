import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { PromotionForm } from "@/components/admin/promotion-form";

export default async function NewPromotionPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const [{ data: products }, { data: groups }, { data: typologies }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("name"),
    supabase.from("product_groups").select("*").eq("is_active", true).order("name"),
    supabase.from("product_typologies").select("*").eq("is_active", true).order("name"),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Nuova promozione</h1>
      <div className="mt-6">
        <PromotionForm
          products={products || []}
          groups={groups || []}
          typologies={typologies || []}
        />
      </div>
    </div>
  );
}
