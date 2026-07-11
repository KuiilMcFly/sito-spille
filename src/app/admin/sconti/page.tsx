import Link from "next/link";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import { PROMOTION_TYPE_LABELS } from "@/lib/promotions/types";
import { Plus } from "lucide-react";
import type { PromotionWithTargets } from "@/lib/promotions/types";

export default async function AdminPromotionsPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const { data } = await supabase
    .from("promotions")
    .select("*, promotion_targets(*)")
    .order("priority", { ascending: false });

  const promotions = (data as PromotionWithTargets[] | null) || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sconti e bundle</h1>
          <p className="mt-1 text-ink-400">
            Promozioni su prodotti, gruppi e tipologie. Solo admin decide scontistica e regole.
          </p>
        </div>
        <Link href="/admin/sconti/nuova">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuova promozione
          </Button>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Codice</th>
              <th className="px-4 py-3 text-left">Utilizzi</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {promotions.map((p) => (
              <tr key={p.id} className="bg-ink-900">
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-ink-200">{PROMOTION_TYPE_LABELS[p.promotion_type]}</td>
                <td className="px-4 py-3 text-ink-200">{p.code || "Auto"}</td>
                <td className="px-4 py-3 text-ink-200">
                  {p.usage_count}
                  {p.usage_limit != null ? " / " + p.usage_limit : ""}
                </td>
                <td className="px-4 py-3">
                  <span className={p.is_active ? "text-emerald-400" : "text-ink-500"}>
                    {p.is_active ? "Attiva" : "Disattiva"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AdminRowActions
                    editHref={"/admin/sconti/" + p.id}
                    deleteApiUrl={"/api/admin/promotions/" + p.id}
                    resourceLabel={"la promozione \"" + p.name + "\""}
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
