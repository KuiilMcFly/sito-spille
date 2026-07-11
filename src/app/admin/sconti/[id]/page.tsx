import { notFound } from "next/navigation";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { PromotionForm } from "@/components/admin/promotion-form";
import type { PromotionWithTargets } from "@/lib/promotions/types";

type Props = { params: Promise<{ id: string }> };

export default async function EditPromotionPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const [{ data: promotion }, { data: products }, { data: groups }, { data: typologies }] =
    await Promise.all([
      supabase.from("promotions").select("*, promotion_targets(*)").eq("id", id).single(),
      supabase.from("products").select("*").eq("is_active", true).order("name"),
      supabase.from("product_groups").select("*").eq("is_active", true).order("name"),
      supabase.from("product_typologies").select("*").eq("is_active", true).order("name"),
    ]);

  if (!promotion) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Modifica promozione</h1>
      <div className="mt-6">
        <PromotionForm
          promotion={promotion as PromotionWithTargets}
          products={products || []}
          groups={groups || []}
          typologies={typologies || []}
        />
      </div>
    </div>
  );
}
