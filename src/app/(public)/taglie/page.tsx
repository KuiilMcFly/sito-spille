import Link from "next/link";
import { getPublicReadClient } from "@/lib/supabase/public-read";
import { SizeComparison } from "@/components/catalog/size-comparison";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { Tables } from "@/types/database";

export const metadata = {
  title: "Confronto taglie",
  description: "Confronta diametro e prezzi delle taglie spilla disponibili.",
};

export default async function SizesPage() {
  const supabase = await getPublicReadClient();
  let sizes: Tables<"pin_sizes">[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("pin_sizes")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    sizes = data || [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <ScrollReveal>
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-ink-900 md:text-5xl">
            Confronto taglie
          </h1>
          <p className="mt-3 text-ink-700">
            Scegli la dimensione giusta per la tua spilla personalizzata.
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Anche i prodotti catalogo usano queste taglie.{" "}
            <Link href="/prodotti" className="text-brand-600 underline">
              Vedi catalogo
            </Link>
          </p>
        </div>
      </ScrollReveal>
      <ScrollReveal delayMs={100}>
        <SizeComparison sizes={sizes} />
      </ScrollReveal>
    </div>
  );
}
