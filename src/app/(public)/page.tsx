import Link from "next/link";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { getPublicSettings } from "@/lib/settings";
import { ProductGrid } from "@/components/catalog/product-grid";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { Palette, Truck, Shield } from "lucide-react";
import type { HeroSlideWithProduct, ProductWithImages } from "@/types/database";

export default async function HomePage() {
  const settings = await getPublicSettings();
  let products: ProductWithImages[] = [];
  let slides: HeroSlideWithProduct[] = [];

  const supabase = await createClientIfConfigured();
  if (supabase) {
    try {
      const [productsRes, slidesRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, product_images(*), pin_sizes(*)")
          .eq("is_active", true)
          .eq("is_featured", true)
          .order("sort_order"),
        supabase
          .from("hero_slides")
          .select("*, products(*, product_images(*), pin_sizes(*))")
          .eq("is_active", true)
          .order("sort_order"),
      ]);
      products = (productsRes.data as unknown as ProductWithImages[]) || [];
      slides = (slidesRes.data as unknown as HeroSlideWithProduct[]) || [];
    } catch {
      products = [];
      slides = [];
    }
  }

  const heroTitle =
    (settings.hero_title as { text?: string })?.text ||
    "Crea la tua spilla personalizzata";
  const heroSubtitle =
    (settings.hero_subtitle as { text?: string })?.text ||
    "Design unico per il tuo zaino.";

  return (
    <div>
      <HeroCarousel
        slides={slides}
        fallbackTitle={heroTitle}
        fallbackSubtitle={heroSubtitle}
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-ink-900">
          Prodotti in evidenza
        </h2>
        <p className="mt-2 text-ink-700">
          Scopri le spille pronte da ordinare o lasciati ispirare.
        </p>
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-brand-100 p-6 text-center">
            <Palette className="mx-auto h-10 w-10 text-brand-500" />
            <h3 className="mt-4 font-bold text-ink-900">Design personalizzato</h3>
            <p className="mt-2 text-sm text-ink-600">
              Carica la tua immagine e posizionala sulla spilla rotonda.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 p-6 text-center">
            <Truck className="mx-auto h-10 w-10 text-brand-500" />
            <h3 className="mt-4 font-bold text-ink-900">Spedizione in Italia</h3>
            <p className="mt-2 text-sm text-ink-600">
              Consegna rapida con tracking e supporto dedicato.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 p-6 text-center">
            <Shield className="mx-auto h-10 w-10 text-brand-500" />
            <h3 className="mt-4 font-bold text-ink-900">Pagamento sicuro</h3>
            <p className="mt-2 text-sm text-ink-600">
              Checkout protetto con PayPal.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-ink-900">FAQ</h2>
        <div className="mt-6 space-y-4">
          <details className="rounded-xl border border-brand-100 p-4">
            <summary className="cursor-pointer font-semibold">Che formati accettate?</summary>
            <p className="mt-2 text-sm text-ink-600">JPG, PNG e WebP fino a 15MB.</p>
          </details>
          <details className="rounded-xl border border-brand-100 p-4">
            <summary className="cursor-pointer font-semibold">Quanto tempo per la produzione?</summary>
            <p className="mt-2 text-sm text-ink-600">Di solito 3-7 giorni lavorativi dopo il pagamento.</p>
          </details>
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/crea"
            className="inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg hover:bg-brand-600"
          >
            Inizia ora
          </Link>
        </div>
      </section>
    </div>
  );
}
