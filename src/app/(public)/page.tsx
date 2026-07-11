import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicSettings } from "@/lib/settings";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Sparkles, Palette, Truck, Shield } from "lucide-react";
import type { ProductWithImages } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  const settings = await getPublicSettings();

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*), pin_sizes(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order");

  const heroTitle =
    (settings.hero_title as { text?: string })?.text ||
    "Crea la tua spilla personalizzata";
  const heroSubtitle =
    (settings.hero_subtitle as { text?: string })?.text ||
    "Design unico per il tuo zaino.";

  return (
    <div>
      <section className="gradient-hero px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Sparkles className="h-4 w-4" />
            Spille custom per zaini
          </span>
          <h1 className="font-display mt-6 text-4xl font-bold leading-tight text-ink-900 md:text-6xl">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-700">
            {heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/crea"
              className="rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
            >
              Crea la tua spilla
            </Link>
            <Link
              href="/prodotti"
              className="rounded-full border-2 border-brand-300 px-8 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Vedi catalogo
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-ink-900">
          Prodotti in evidenza
        </h2>
        <p className="mt-2 text-ink-700">
          Scopri le spille pronte da ordinare o lasciati ispirare.
        </p>
        <div className="mt-8">
          <ProductGrid products={(products as unknown as ProductWithImages[]) || []} />
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-brand-100 p-6 text-center">
            <Palette className="mx-auto h-10 w-10 text-brand-500" />
            <h3 className="mt-4 font-display text-xl font-bold">100% Personalizzabile</h3>
            <p className="mt-2 text-sm text-ink-700">
              Carica qualsiasi foto o disegno e posizionalo come preferisci.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 p-6 text-center">
            <Truck className="mx-auto h-10 w-10 text-brand-500" />
            <h3 className="mt-4 font-display text-xl font-bold">Spedizione in Italia</h3>
            <p className="mt-2 text-sm text-ink-700">
              Produciamo e spediamo con cura ogni ordine.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 p-6 text-center">
            <Shield className="mx-auto h-10 w-10 text-brand-500" />
            <h3 className="mt-4 font-display text-xl font-bold">Pagamento sicuro</h3>
            <p className="mt-2 text-sm text-ink-700">
              Checkout protetto tramite PayPal.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-ink-900">FAQ</h2>
        <div className="mt-6 space-y-4">
          <details className="rounded-xl border border-brand-100 bg-white p-4">
            <summary className="cursor-pointer font-semibold">
              Che formati immagine posso caricare?
            </summary>
            <p className="mt-2 text-sm text-ink-700">
              JPG, PNG e WebP fino a 10MB. Consigliamo almeno 500x500 pixel.
            </p>
          </details>
          <details className="rounded-xl border border-brand-100 bg-white p-4">
            <summary className="cursor-pointer font-semibold">
              Quanto tempo ci vuole per la produzione?
            </summary>
            <p className="mt-2 text-sm text-ink-700">
              Di solito 3-5 giorni lavorativi dopo la conferma del pagamento.
            </p>
          </details>
          <details className="rounded-xl border border-brand-100 bg-white p-4">
            <summary className="cursor-pointer font-semibold">
              Posso ordinare piu spille con lo stesso design?
            </summary>
            <p className="mt-2 text-sm text-ink-700">
              Si, seleziona la quantita desiderata nel customizer.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
