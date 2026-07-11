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
  const supabase = await createClientIfConfigured();
  const user = await getServerUser();

  const [sizesResult, ordersOpen, theme] = await Promise.all([
    supabase
      ? supabase.from("pin_sizes").select("*").eq("is_active", true).order("sort_order")
      : Promise.resolve({ data: [] as Tables<"pin_sizes">[] }),
    areOrdersOpen(),
    getThemeColors(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold text-ink-900 md:text-5xl">
          Crea la tua spilla
        </h1>
        <p className="mt-3 text-ink-700">
          Carica la tua immagine, personalizza e aggiungi al carrello.
        </p>
      </div>
      <PinCustomizer
        sizes={sizesResult.data || []}
        ordersOpen={ordersOpen}
        previewFillColor={theme.brand100}
        previewStrokeColor={theme.brand500}
        loggedIn={Boolean(user)}
        initialDraftId={draft || null}
      />
    </div>
  );
}
