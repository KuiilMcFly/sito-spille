import Link from "next/link";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminHeroPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const { data: slides } = await supabase
    .from("hero_slides")
    .select("*, products(name)")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Hero carosello</h1>
          <p className="mt-1 text-ink-400">Slide home con prodotto e background</p>
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
              <th className="px-4 py-3 text-left">Prodotto</th>
              <th className="px-4 py-3 text-left">Ordine</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {slides?.map((s) => (
              <tr key={s.id} className="bg-ink-900">
                <td className="px-4 py-3 text-white">
                  {(s.products as { name?: string } | null)?.name || "—"}
                </td>
                <td className="px-4 py-3 text-ink-200">{s.sort_order}</td>
                <td className="px-4 py-3">
                  <span className={s.is_active ? "text-emerald-400" : "text-ink-500"}>
                    {s.is_active ? "Attiva" : "Disattiva"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={"/admin/hero/" + s.id} className="text-brand-400 hover:underline">
                    Modifica
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
