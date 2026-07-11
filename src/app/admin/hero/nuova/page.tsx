import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";

export default async function NewHeroSlidePage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const [{ data: products }, { data: groups }, { data: typologies }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("name"),
    supabase.from("product_groups").select("*").eq("is_active", true).order("name"),
    supabase.from("product_typologies").select("*").eq("is_active", true).order("name"),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Nuova slide hero</h1>
      <div className="mt-6">
        <HeroSlideForm
          products={products || []}
          groups={groups || []}
          typologies={typologies || []}
        />
      </div>
    </div>
  );
}
