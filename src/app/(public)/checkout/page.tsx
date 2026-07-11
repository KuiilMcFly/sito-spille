import { createClientIfConfigured, getServerUser } from "@/lib/supabase/server";
import { getFreeShippingThreshold, getShippingMethods } from "@/lib/orders/pricing";
import { areOrdersOpen } from "@/lib/orders/orders-open";
import { CheckoutClient } from "@/components/cart/checkout-client";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getServerUser();
  const supabase = await createClientIfConfigured();

  const [shippingMethods, freeShippingThreshold, ordersOpen] = await Promise.all([
    getShippingMethods(),
    getFreeShippingThreshold(),
    areOrdersOpen(),
  ]);

  let profile = null;
  if (user && supabase) {
    try {
      const { data } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = data;
    } catch {
      profile = null;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-900">Checkout</h1>
      <div className="mt-8">
        <CheckoutClient
          shippingMethods={shippingMethods}
          freeShippingThreshold={freeShippingThreshold}
          ordersOpen={ordersOpen}
          loggedInEmail={user?.email}
          loggedInPhone={profile?.phone}
          loggedInName={profile?.full_name}
        />
      </div>
    </div>
  );
}
