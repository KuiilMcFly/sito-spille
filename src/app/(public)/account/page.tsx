import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import { Badge, getOrderStatusVariant } from "@/components/ui/badge";
import { Package, Settings, LogOut } from "lucide-react";

export const metadata = { title: "Il mio account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/accedi");

  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role === "admin") redirect("/admin");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("customer_profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("*")
      .or("user_id.eq." + user.id + ",customer_email.eq." + user.email)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">
            Ciao, {profile?.full_name || user.email}
          </h1>
          <p className="mt-1 text-ink-700">{user.email}</p>
        </div>
        <form action="/account/logout" method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-700 hover:bg-brand-50"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/ordini"
          className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-6 transition hover:shadow-lg"
        >
          <Package className="h-8 w-8 text-brand-500" />
          <div>
            <p className="font-semibold text-ink-900">I miei ordini</p>
            <p className="text-sm text-ink-400">{orders?.length || 0} ordini recenti</p>
          </div>
        </Link>
        <Link
          href="/account/profilo"
          className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-6 transition hover:shadow-lg"
        >
          <Settings className="h-8 w-8 text-brand-500" />
          <div>
            <p className="font-semibold text-ink-900">Profilo</p>
            <p className="text-sm text-ink-400">Modifica i tuoi dati</p>
          </div>
        </Link>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink-900">Ordini recenti</h2>
          <Link href="/account/ordini" className="text-sm text-brand-600 hover:underline">
            Vedi tutti
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <Link
                key={order.id}
                href={"/account/ordini/" + order.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-100 bg-white p-4 transition hover:border-brand-300"
              >
                <div>
                  <p className="font-semibold text-ink-900">{order.order_number}</p>
                  <p className="text-sm text-ink-400">
                    {new Date(order.created_at).toLocaleDateString("it-IT")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getOrderStatusVariant(order.status)}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <span className="font-bold text-brand-600">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="py-8 text-center text-ink-400">
              Nessun ordine ancora.{" "}
              <Link href="/crea" className="text-brand-600 underline">
                Crea la tua spilla
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
