import { getPublicReadClient } from "@/lib/supabase/public-read";
import { createClientIfConfigured, getServerUser } from "@/lib/supabase/server";
import { areOrdersOpen } from "@/lib/orders/orders-open";
import { getThemeColors } from "@/lib/theme/get-theme";
import { PinCustomizer } from "@/components/customizer/pin-customizer";
import type { Tables } from "@/types/database";

export const metadata = {
  title: "Crea la tua spilla",
  description: "Personalizza la tua spilla rotonda con foto o disegno.",
};

type Props = {
  searchParams: Promise<{ draft?: string }>;
};

export default async function CreatePage({ searchParams }: Props) {
  const { draft } = await searchParams;
  const supabase = await getPublicReadClient();
  const authSupabase = await createClientIfConfigured();
  const user = await getServerUser();

  const [sizesResult, ordersOpen, theme] = await Promise.all([
    supabase
      ? supabase.from("pin_sizes").select("*").eq("is_active", true).order("sort_order")
      : Promise.resolve({ data: [] as Tables<"pin_sizes">[] }),
    areOrdersOpen(),
    getThemeColors(),
  ]);

  let profile: Tables<"customer_profiles"> | null = null;
  let savedAddresses: Tables<"customer_addresses">[] = [];

  if (user && authSupabase) {
    try {
      const [{ data }, { data: addresses }] = await Promise.all([
        authSupabase.from("customer_profiles").select("*").eq("id", user.id).single(),
        authSupabase
          .from("customer_addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);
      profile = data;
      savedAddresses = addresses || [];
    } catch {
      profile = null;
      savedAddresses = [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold text-ink-900 md:text-5xl">
          Crea la tua spilla
        </h1>
        <p className="mt-3 text-ink-700">
          Carica la tua immagine, personalizzala nel cerchio e invia l&apos;ordine.
        </p>
      </div>
      <PinCustomizer
        sizes={sizesResult.data || []}
        ordersOpen={ordersOpen}
        previewFillColor={theme.brand100}
        previewStrokeColor={theme.brand500}
        loggedIn={Boolean(user)}
        initialDraftId={draft || null}
        loggedInEmail={user?.email}
        loggedInPhone={profile?.phone}
        loggedInName={profile?.full_name}
        savedAddresses={savedAddresses}
      />
    </div>
  );
}
