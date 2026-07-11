import { createClient } from "@/lib/supabase/server";
import { getFreeShippingThreshold, getShippingMethods } from "@/lib/orders/pricing";
import { areOrdersOpen } from "@/lib/orders/orders-open";
import { getThemeColors } from "@/lib/theme/get-theme";
import { PinCustomizer } from "@/components/customizer/pin-customizer";

export const metadata = {
  title: "Crea la tua spilla",
  description: "Personalizza la tua spilla rotonda con foto o disegno.",
};

export default async function CreatePage() {
  const supabase = await createClient();

  const [{ data: sizes }, shippingMethods, freeShippingThreshold, ordersOpen, theme, { data: { user } }] =
    await Promise.all([
      supabase.from("pin_sizes").select("*").eq("is_active", true).order("sort_order"),
      getShippingMethods(),
      getFreeShippingThreshold(),
      areOrdersOpen(),
      getThemeColors(),
      supabase.auth.getUser(),
    ]);

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold text-ink-900 md:text-5xl">
          Crea la tua spilla
        </h1>
        <p className="mt-3 text-ink-700">
          Carica la tua immagine, personalizza posizione e taglia, poi ordina.
        </p>
      </div>
      <PinCustomizer
        sizes={sizes || []}
        shippingMethods={shippingMethods}
        freeShippingThreshold={freeShippingThreshold}
        ordersOpen={ordersOpen}
        previewFillColor={theme.brand100}
        previewStrokeColor={theme.brand500}
        loggedInEmail={user?.email}
        loggedInPhone={profile?.phone}
        loggedInName={profile?.full_name}
      />
    </div>
  );
}
