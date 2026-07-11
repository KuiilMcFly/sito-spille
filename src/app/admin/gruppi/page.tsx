import Link from "next/link";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminGroupsPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const { data: groups } = await supabase
    .from("product_groups")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gruppi prodotti</h1>
          <p className="mt-1 text-ink-400">Collezioni tematiche con cover e background</p>
        </div>
        <Link href="/admin/gruppi/nuovo">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo gruppo
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
            {groups?.map((g) => (
              <tr key={g.id} className="bg-ink-900">
                <td className="px-4 py-3 text-white">{g.name}</td>
                <td className="px-4 py-3 text-ink-200">{g.slug}</td>
                <td className="px-4 py-3 text-ink-200">{g.sort_order}</td>
                <td className="px-4 py-3">
                  <span className={g.is_active ? "text-emerald-400" : "text-ink-500"}>
                    {g.is_active ? "Attivo" : "Disattivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={"/admin/gruppi/" + g.id} className="text-brand-400 hover:underline">
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
