import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { SettingsForm } from "@/components/admin/settings-form";
import { OrdersToggle } from "@/components/admin/orders-toggle";
import { ThemeSettingsForm } from "@/components/admin/theme-settings-form";
import { areOrdersOpen } from "@/lib/orders/orders-open";
import { DEFAULT_STORE_NAME, DEFAULT_STORE_TAGLINE } from "@/lib/settings";

export default async function AdminSettingsPage() {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;
  const keys = [
    "free_shipping_threshold",
    "store_email",
    "store_phone",
    "hero_title",
    "hero_subtitle",
    "store_name",
    "store_tagline",
    "social_links",
    "orders_open",
    "theme_colors",
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
        <ThemeSettingsForm
          initialPrimary={String(initial.theme_colors?.primary || "")}
          initialAccent={String(initial.theme_colors?.accent || "")}
          previewTitle={
            String(initial.store_name?.text || DEFAULT_STORE_NAME) +
            " " +
            String(initial.store_tagline?.text || DEFAULT_STORE_TAGLINE)
          }
        />
        <SettingsForm initial={initial} />
      </div>
    </div>
  );
}
