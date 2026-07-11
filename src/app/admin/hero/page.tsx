import Link from "next/link";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import { getHeroSlideFeatureLabel } from "@/lib/hero/hero-slide-label";
import { Plus } from "lucide-react";
import type { Tables } from "@/types/database";

type HeroSlideRow = Tables<"hero_slides"> & {
  products: { name?: string } | null;
  product_groups: { name?: string } | null;
  product_typologies: { name?: string } | null;
};

export default async function AdminHeroPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const { data: slides } = await supabase
    .from("hero_slides")
    .select("*, products(name), product_groups(name), product_typologies(name)")
    .order("sort_order");

  const rows = (slides as HeroSlideRow[] | null) || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Hero carosello</h1>
          <p className="mt-1 text-ink-400">Slide home con prodotto, gruppo, tipologia o solo sfondo</p>
        </div>
        <Link href="/admin/hero/nuova">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuova slide
          </Button>
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-4 py-3 text-left">Contenuto</th>
              <th className="px-4 py-3 text-left">Ordine</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {rows.map((s) => (
              <tr key={s.id} className="bg-ink-900">
                <td className="px-4 py-3 text-white">{getHeroSlideFeatureLabel(s)}</td>
                <td className="px-4 py-3 text-ink-200">{s.sort_order}</td>
                <td className="px-4 py-3">
                  <span className={s.is_active ? "text-emerald-400" : "text-ink-500"}>
                    {s.is_active ? "Attiva" : "Disattiva"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AdminRowActions
                    editHref={"/admin/hero/" + s.id}
                    deleteApiUrl={"/api/admin/hero-slides/" + s.id}
                    resourceLabel={"la slide hero \"" + getHeroSlideFeatureLabel(s) + "\""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
