import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import { Badge, getOrderStatusVariant } from "@/components/ui/badge";
import { getFinishEffectLabel } from "@/lib/customizer/finish-effects";
import type { CustomizationData } from "@/types/database";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Dettaglio ordine" };

export default async function AccountOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accedi");

  const adminSupabase = createAdminClient();
  const { data: order } = await adminSupabase.from("orders").select("*").eq("id", id).single();

  if (!order) notFound();

  const isOwner =
    order.user_id === user.id ||
    order.customer_email.toLowerCase() === (user.email || "").toLowerCase();

  if (!isOwner) notFound();

  const [
    { data: items },
    { data: shippingMethod },
    { data: history },
  ] = await Promise.all([
    adminSupabase.from("order_items").select("*, pin_sizes(*), products(*)").eq("order_id", id),
    order.shipping_method_id
      ? adminSupabase.from("shipping_methods").select("*").eq("id", order.shipping_method_id).single()
      : Promise.resolve({ data: null }),
    adminSupabase.from("order_status_history").select("*").eq("order_id", id).order("created_at"),
  ]);

  const customItems = items?.filter((i) => i.is_custom) || [];
  const customDesigns: { url: string; effect: string }[] = [];
  for (const item of customItems) {
    if (!item.custom_design_path) continue;
    const { data: signed } = await adminSupabase.storage
      .from("custom-designs")
      .createSignedUrl(item.custom_design_path, 3600);
    if (signed?.signedUrl) {
      const data = item.customization_data as CustomizationData | null;
      customDesigns.push({
        url: signed.signedUrl,
        effect: getFinishEffectLabel(data?.finishEffect),
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/account/ordini" className="text-sm text-brand-600 hover:underline">
        Torna ai miei ordini
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-3xl font-bold text-ink-900">{order.order_number}</h1>
        <Badge variant={getOrderStatusVariant(order.status)}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <p className="mt-2 text-sm text-ink-400">
        Ordine del {new Date(order.created_at).toLocaleString("it-IT")}
      </p>

      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="font-semibold text-ink-900">Stato spedizione</h2>
          <p className="mt-2 text-ink-700">
            {ORDER_STATUS_LABELS[order.status]}
          </p>
          {shippingMethod && (
            <p className="mt-1 text-sm text-ink-400">
              Metodo: {shippingMethod.name}
              {shippingMethod.estimated_days ? " — " + shippingMethod.estimated_days : ""}
            </p>
          )}
        </div>

        {customDesigns.length > 0 && (
          <div className="rounded-2xl border border-brand-100 bg-white p-6 text-center">
            <h2 className="font-semibold text-ink-900">I tuoi design</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {customDesigns.map((design, idx) => (
                <div key={idx}>
                  <img
                    src={design.url}
                    alt="Design spilla"
                    className="mx-auto h-40 w-40 rounded-full object-cover pin-shadow"
                  />
                  <p className="mt-2 text-xs text-ink-500">{design.effect}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="font-semibold text-ink-900">Riepilogo</h2>
          <ul className="mt-4 space-y-2">
            {items?.map((item) => {
              const customData = item.customization_data as CustomizationData | null;
              return (
                <li key={item.id} className="text-sm text-ink-700">
                  <div className="flex justify-between">
                    <span>
                      {item.is_custom ? "Spilla custom" : (item.products as { name: string } | null)?.name}{" "}
                      x{item.quantity} ({(item.pin_sizes as { name: string } | null)?.name})
                    </span>
                    <span>{formatPrice(item.line_total)}</span>
                  </div>
                  {item.is_custom && customData?.finishEffect && (
                    <p className="text-xs text-ink-400">
                      Effetto: {getFinishEffectLabel(customData.finishEffect)}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-4 border-t border-brand-100 pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotale</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Spedizione</span>
              <span>{order.shipping_cost === 0 ? "Gratis" : formatPrice(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-bold text-brand-600">
              <span>Totale</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {history && history.length > 0 && (
          <div className="rounded-2xl border border-brand-100 bg-white p-6">
            <h2 className="font-semibold text-ink-900">Cronologia stato</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-400">
              {history.map((h) => (
                <li key={h.id}>
                  {new Date(h.created_at).toLocaleString("it-IT")}:{" "}
                  {ORDER_STATUS_LABELS[h.to_status] || h.to_status}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
