import Link from "next/link";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;
  const { data: products } = await supabase
    .from("products")
    .select("*, pin_sizes(name)")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Prodotti</h1>
        <Link href="/admin/prodotti/nuovo">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo prodotto
          </Button>
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Taglia</th>
              <th className="px-4 py-3 text-left">Prezzo</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {products?.map((product) => (
              <tr key={product.id} className="bg-ink-900">
                <td className="px-4 py-3 text-white">{product.name}</td>
                <td className="px-4 py-3 text-ink-200">
                  {(product.pin_sizes as { name: string } | null)?.name}
                </td>
                <td className="px-4 py-3 text-ink-200">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">
                  <span className={product.is_active ? "text-emerald-400" : "text-ink-500"}>
                    {product.is_active ? "Attivo" : "Disattivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={"/admin/prodotti/" + product.id} className="text-brand-400 hover:underline">
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
