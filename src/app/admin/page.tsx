import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import { areOrdersOpen } from "@/lib/orders/orders-open";
import { Badge, getOrderStatusVariant } from "@/components/ui/badge";
import type { Tables } from "@/types/database";
import Link from "next/link";
import { Package, ShoppingCart, Euro, Clock, Lock } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) {
    return null;
  }

  let totalOrders = 0;
  let pendingOrders = 0;
  let recentOrders: Tables<"orders">[] = [];
  let paidOrders: { total_amount: number }[] = [];
  let activeProducts = 0;
  let ordersOpen = true;

  try {
    const [
      totalOrdersResult,
      pendingOrdersResult,
      recentOrdersResult,
      paidOrdersResult,
      activeProductsResult,
      ordersOpenResult,
    ] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("orders").select("total_amount").eq("status", "paid"),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      areOrdersOpen(),
    ]);

    totalOrders = totalOrdersResult.count || 0;
    pendingOrders = pendingOrdersResult.count || 0;
    recentOrders = recentOrdersResult.data || [];
    paidOrders = paidOrdersResult.data || [];
    activeProducts = activeProductsResult.count || 0;
    ordersOpen = ordersOpenResult;
  } catch {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
        Errore caricamento dashboard. Controlla le credenziali Supabase su Vercel.
      </div>
    );
  }

  const revenue =
    paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

  const stats = [
    { label: "Ordini totali", value: totalOrders, icon: ShoppingCart },
    { label: "Da accettare", value: pendingOrders, icon: Clock },
    { label: "Prodotti attivi", value: activeProducts, icon: Package },
    { label: "Ricavi (pagati)", value: formatPrice(revenue), icon: Euro },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-ink-400">Panoramica del negozio</p>

      {!ordersOpen && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-300" />
            <div>
              <p className="font-semibold text-amber-200">Ordini temporaneamente chiusi</p>
              <p className="text-sm text-amber-100/80">
                I clienti non possono effettuare nuovi ordini.
              </p>
            </div>
          </div>
          <Link
            href="/admin/impostazioni"
            className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-amber-400"
          >
            Gestisci
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-ink-700 bg-ink-800 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-400">{stat.label}</p>
              <stat.icon className="h-5 w-5 text-brand-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Ordini recenti</h2>
          <Link href="/admin/ordini" className="text-sm text-brand-400 hover:underline">
            Vedi tutti
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-ink-700">
          <table className="w-full text-sm">
            <thead className="bg-ink-800 text-ink-400">
              <tr>
                <th className="px-4 py-3 text-left">Ordine</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Totale</th>
                <th className="px-4 py-3 text-left">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {recentOrders.map((order) => (
                <tr key={order.id} className="bg-ink-900">
                  <td className="px-4 py-3">
                    <Link
                      href={"/admin/ordini/" + order.id}
                      className="text-brand-400 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-200">{order.customer_email}</td>
                  <td className="px-4 py-3 text-ink-200">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getOrderStatusVariant(order.status)}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
