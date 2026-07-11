import { createAdminClient } from "@/lib/supabase/admin";
import type { PromotionWithTargets } from "@/lib/promotions/types";

export async function loadActivePromotions(): Promise<PromotionWithTargets[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("promotions")
    .select("*, promotion_targets(*)")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  return (data as PromotionWithTargets[] | null) || [];
}

export async function loadAllPromotions(): Promise<PromotionWithTargets[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("promotions")
    .select("*, promotion_targets(*)")
    .order("priority", { ascending: false });

  return (data as PromotionWithTargets[] | null) || [];
}
