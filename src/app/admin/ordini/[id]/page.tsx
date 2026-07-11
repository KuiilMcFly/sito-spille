import { notFound } from "next/navigation";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import { Badge, getOrderStatusVariant } from "@/components/ui/badge";
import { OrderActions } from "@/components/admin/order-actions";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!order) notFound();

  const [
    { data: orderItems },
    { data: payment },
    { data: history },
  ] = await Promise.all([
    supabase.from("order_items").select("*, pin_sizes(*), products(*)").eq("order_id", id),
    supabase.from("payments").select("*").eq("order_id", id).single(),
    supabase.from("order_status_history").select("*").eq("order_id", id).order("created_at"),
  ]);

  const customItem = orderItems?.find((i) => i.is_custom);
  const designPath = customItem?.custom_design_path;

  let designUrl: string | null = null;
  if (designPath) {
    const { data: signed } = await supabase.storage
      .from("custom-designs")
      .createSignedUrl(designPath, 3600);
    designUrl = signed?.signedUrl || null;
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-white">{order.order_number}</h1>
        <Badge variant={getOrderStatusVariant(order.status)}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-ink-700 bg-ink-800 p-6">
            <h3 className="font-semibold text-white">Cliente</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-400">Email</dt>
                <dd className="text-ink-200">{order.customer_email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Telefono</dt>
                <dd className="text-ink-200">{order.customer_phone}</dd>
              </div>
              {order.customer_name && (
                <div className="flex justify-between">
                  <dt className="text-ink-400">Nome</dt>
                  <dd className="text-ink-200">{order.customer_name}</dd>
                </div>
              )}
              {order.customer_notes && (
                <div>
                  <dt className="text-ink-400">Note cliente</dt>
                  <dd className="mt-1 text-ink-200">{order.customer_notes}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-ink-700 bg-ink-800 p-6">
            <h3 className="font-semibold text-white">Righe ordine</h3>
            <ul className="mt-4 space-y-3">
              {orderItems?.map((item) => (
                <li key={item.id} className="flex justify-between text-sm text-ink-200">
                  <span>
                    {item.is_custom ? "Spilla custom" : (item.products as { name: string } | null)?.name}{" "}
                    x{item.quantity} ({(item.pin_sizes as { name: string } | null)?.name})
                  </span>
                  <span>{formatPrice(item.line_total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-ink-700 pt-4">
              <div className="flex justify-between text-sm text-ink-400">
                <span>Spedizione</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="mt-2 flex justify-between font-bold text-white">
                <span>Totale</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {payment && (
            <div className="rounded-xl border border-ink-700 bg-ink-800 p-6">
              <h3 className="font-semibold text-white">Pagamento PayPal</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-400">Stato</dt>
                  <dd className="text-ink-200">{payment.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-400">PayPal Order ID</dt>
                  <dd className="text-ink-200 text-xs">{payment.paypal_order_id}</dd>
                </div>
                {payment.paypal_capture_id && (
                  <div className="flex justify-between">
                    <dt className="text-ink-400">Capture ID</dt>
                    <dd className="text-ink-200 text-xs">{payment.paypal_capture_id}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {designUrl && (
            <div className="rounded-xl border border-ink-700 bg-ink-800 p-6">
              <h3 className="font-semibold text-white">Design custom</h3>
              <img
                src={designUrl}
                alt="Design custom"
                className="mt-4 mx-auto h-64 w-64 rounded-full object-cover pin-shadow"
              />
            </div>
          )}

          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            adminNotes={order.admin_notes}
          />

          {history && history.length > 0 && (
            <div className="rounded-xl border border-ink-700 bg-ink-800 p-6">
              <h3 className="font-semibold text-white">Storico stati</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {history.map((h) => (
                  <li key={h.id} className="text-ink-400">
                    {new Date(h.created_at).toLocaleString("it-IT")}:{" "}
                    {h.from_status || "—"} → {ORDER_STATUS_LABELS[h.to_status] || h.to_status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
