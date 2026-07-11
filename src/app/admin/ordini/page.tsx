import Link from "next/link";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import { Badge, getOrderStatusVariant } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Ordini</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-4 py-3 text-left">Ordine</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Totale</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {orders?.map((order) => (
              <tr key={order.id} className="bg-ink-900">
                <td className="px-4 py-3">
                  <Link href={"/admin/ordini/" + order.id} className="text-brand-400 hover:underline">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-200">{order.order_type}</td>
                <td className="px-4 py-3 text-ink-200">{order.customer_email}</td>
                <td className="px-4 py-3 text-ink-200">{formatPrice(order.total_amount)}</td>
                <td className="px-4 py-3">
                  <Badge variant={getOrderStatusVariant(order.status)}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-ink-400">
                  {new Date(order.created_at).toLocaleDateString("it-IT")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
