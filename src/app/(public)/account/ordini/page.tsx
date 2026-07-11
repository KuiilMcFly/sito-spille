import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import { Badge, getOrderStatusVariant } from "@/components/ui/badge";

export const metadata = { title: "I miei ordini" };

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accedi");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .or("user_id.eq." + user.id + ",customer_email.eq." + user.email)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/account" className="text-sm text-brand-600 hover:underline">
        Torna all account
      </Link>
      <h1 className="font-display mt-4 text-3xl font-bold text-ink-900">I miei ordini</h1>

      <div className="mt-8 space-y-3">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <Link
              key={order.id}
              href={"/account/ordini/" + order.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-100 bg-white p-5 transition hover:border-brand-300"
            >
              <div>
                <p className="font-semibold text-ink-900">{order.order_number}</p>
                <p className="text-sm text-ink-400">
                  {order.order_type === "custom" ? "Spilla personalizzata" : "Catalogo"} —{" "}
                  {new Date(order.created_at).toLocaleDateString("it-IT")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={getOrderStatusVariant(order.status)}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <span className="font-bold text-brand-600">{formatPrice(order.total_amount)}</span>
              </div>
            </Link>
          ))
        ) : (
          <p className="py-12 text-center text-ink-400">Nessun ordine trovato.</p>
        )}
      </div>
    </div>
  );
}
