import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice, PAYMENT_STATUS_LABELS } from "@/lib/utils";
import Link from "next/link";

export default async function AdminPaymentsPage() {
  const supabase = createAdminClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, orders(order_number, customer_email), payment_events(id, event_type, created_at)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Pagamenti</h1>
      <p className="mt-1 text-ink-400">Tracciamento completo transazioni PayPal</p>

      <div className="mt-6 space-y-4">
        {payments?.map((payment) => {
          const order = payment.orders as { order_number: string; customer_email: string } | null;
          const events = payment.payment_events as { id: string; event_type: string; created_at: string }[] | null;

          return (
            <div key={payment.id} className="rounded-xl border border-ink-700 bg-ink-800 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  {order && (
                    <Link href={"/admin/ordini/" + payment.order_id} className="text-brand-400 hover:underline">
                      {order.order_number}
                    </Link>
                  )}
                  <p className="text-sm text-ink-400">{order?.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatPrice(payment.amount)}</p>
                  <p className="text-sm text-ink-400">
                    {PAYMENT_STATUS_LABELS[payment.status] || payment.status}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-ink-500">PayPal Order ID</dt>
                  <dd className="text-ink-200 break-all">{payment.paypal_order_id || "—"}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Capture ID</dt>
                  <dd className="text-ink-200 break-all">{payment.paypal_capture_id || "—"}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Pagatore</dt>
                  <dd className="text-ink-200">{payment.payer_email || "—"}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Pagato il</dt>
                  <dd className="text-ink-200">
                    {payment.paid_at
                      ? new Date(payment.paid_at).toLocaleString("it-IT")
                      : "—"}
                  </dd>
                </div>
              </dl>
              {events && events.length > 0 && (
                <div className="mt-4 border-t border-ink-700 pt-4">
                  <p className="text-xs font-semibold uppercase text-ink-500">Eventi webhook</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink-400">
                    {events.map((ev) => (
                      <li key={ev.id}>
                        {new Date(ev.created_at).toLocaleString("it-IT")} — {ev.event_type}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
