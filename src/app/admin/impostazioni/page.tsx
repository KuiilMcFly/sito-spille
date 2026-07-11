import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "@/components/admin/settings-form";
import { OrdersToggle } from "@/components/admin/orders-toggle";
import { areOrdersOpen } from "@/lib/orders/orders-open";

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const keys = [
    "free_shipping_threshold",
    "store_email",
    "store_phone",
    "hero_title",
    "hero_subtitle",
    "orders_open",
  ];

  const [{ data }, ordersOpen] = await Promise.all([
    supabase.from("site_settings").select("key, value").in("key", keys),
    areOrdersOpen(),
  ]);

  const initial: Record<string, Record<string, unknown>> = {};
  data?.forEach((row) => {
    initial[row.key] = row.value as Record<string, unknown>;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Impostazioni</h1>
      <p className="mt-1 text-ink-400">Configura spedizione, contatti e testi del sito</p>
      <div className="mt-6 space-y-8">
        <OrdersToggle initialOpen={ordersOpen} />
        <SettingsForm initial={initial} />
      </div>
    </div>
  );
}
