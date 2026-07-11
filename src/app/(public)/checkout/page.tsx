import { createClientIfConfigured, getServerUser } from "@/lib/supabase/server";
import { getFreeShippingThreshold, getShippingMethods } from "@/lib/orders/pricing";
import { areOrdersOpen } from "@/lib/orders/orders-open";
import { CheckoutClient } from "@/components/cart/checkout-client";

import type { Tables } from "@/types/database";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getServerUser();
  const supabase = await createClientIfConfigured();

  const [shippingMethods, freeShippingThreshold, ordersOpen] = await Promise.all([
    getShippingMethods(),
    getFreeShippingThreshold(),
    areOrdersOpen(),
  ]);

  let profile: Tables<"customer_profiles"> | null = null;
  let savedAddresses: Tables<"customer_addresses">[] = [];

  async function loadSavedAddresses(userId: string) {
    if (!supabase) return [];
    const { data } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    return data || [];
  }

  if (user && supabase) {
    try {
      const [{ data }, addresses] = await Promise.all([
        supabase.from("customer_profiles").select("*").eq("id", user.id).single(),
        loadSavedAddresses(user.id),
      ]);
      profile = data;
      savedAddresses = addresses;
    } catch {
      profile = null;
      savedAddresses = [];
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
          loggedIn={Boolean(user)}
          loggedInEmail={user?.email}
          loggedInPhone={profile?.phone}
          loggedInName={profile?.full_name}
          savedAddresses={savedAddresses}
        />
      </div>
    </div>
  );
}
