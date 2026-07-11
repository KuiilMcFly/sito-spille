import Link from "next/link";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminShippingPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;
  const { data: methods } = await supabase
    .from("shipping_methods")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Metodi di spedizione</h1>
          <p className="mt-1 text-ink-400">Gestisci costi e tipologie (Punto Poste, domicilio, ecc.)</p>
        </div>
        <Link href="/admin/spedizioni/nuova">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo metodo
          </Button>
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Prezzo</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {methods?.map((m) => (
              <tr key={m.id} className="bg-ink-900">
                <td className="px-4 py-3 text-white">{m.name}</td>
                <td className="px-4 py-3 text-ink-200">
                  {m.delivery_type === "pickup_point" ? "Punto ritiro" : "Domicilio"}
                </td>
                <td className="px-4 py-3 text-ink-200">{formatPrice(m.price)}</td>
                <td className="px-4 py-3">
                  <span className={m.is_active ? "text-emerald-400" : "text-ink-500"}>
                    {m.is_active ? "Attivo" : "Disattivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={"/admin/spedizioni/" + m.id} className="text-brand-400 hover:underline">
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
