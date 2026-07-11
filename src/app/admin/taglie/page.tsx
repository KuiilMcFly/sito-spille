import Link from "next/link";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminSizesPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;
  const { data: sizes } = await supabase
    .from("pin_sizes")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Taglie spilla</h1>
        <Link href="/admin/taglie/nuova">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuova taglia
          </Button>
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Diametro</th>
              <th className="px-4 py-3 text-left">Prezzo custom</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {sizes?.map((size) => (
              <tr key={size.id} className="bg-ink-900">
                <td className="px-4 py-3 text-white">{size.name}</td>
                <td className="px-4 py-3 text-ink-200">{size.diameter_mm} mm</td>
                <td className="px-4 py-3 text-ink-200">{formatPrice(size.custom_price ?? size.base_price)}</td>
                <td className="px-4 py-3">
                  <span className={size.is_active ? "text-emerald-400" : "text-ink-500"}>
                    {size.is_active ? "Attiva" : "Disattiva"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={"/admin/taglie/" + size.id} className="text-brand-400 hover:underline">
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
