import { notFound } from "next/navigation";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditHeroSlidePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const [{ data: slide }, { data: products }] = await Promise.all([
    supabase.from("hero_slides").select("*").eq("id", id).single(),
    supabase.from("products").select("*").eq("is_active", true).order("name"),
  ]);

  if (!slide) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Modifica slide hero</h1>
      <div className="mt-6">
        <HeroSlideForm slide={slide} products={products || []} />
      </div>
    </div>
  );
}
