import Link from "next/link";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import { Plus } from "lucide-react";

export default async function AdminTypologiesPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const { data: typologies } = await supabase
    .from("product_typologies")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tipologie</h1>
          <p className="mt-1 text-ink-400">Anime, Serie TV, Film, Videogiochi...</p>
        </div>
        <Link href="/admin/tipologie/nuova">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuova tipologia
          </Button>
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Ordine</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {typologies?.map((t) => (
              <tr key={t.id} className="bg-ink-900">
                <td className="px-4 py-3 text-white">{t.name}</td>
                <td className="px-4 py-3 text-ink-200">{t.slug}</td>
                <td className="px-4 py-3 text-ink-200">{t.sort_order}</td>
                <td className="px-4 py-3">
                  <span className={t.is_active ? "text-emerald-400" : "text-ink-500"}>
                    {t.is_active ? "Attiva" : "Disattiva"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AdminRowActions
                    editHref={"/admin/tipologie/" + t.id}
                    deleteApiUrl={"/api/admin/typologies/" + t.id}
                    resourceLabel={"la tipologia \"" + t.name + "\""}
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
