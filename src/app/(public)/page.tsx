import Link from "next/link";
import { getPublicReadClient } from "@/lib/supabase/public-read";
import { getPublicSettings } from "@/lib/settings";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { FeaturedGrid } from "@/components/home/featured-grid";
import { GroupGrid } from "@/components/catalog/group-grid";
import { TypologyGrid } from "@/components/catalog/typology-grid";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { loadFeaturedItems } from "@/lib/featured/load-featured-items";
import {
  loadHomeGroupsPreview,
  loadHomeTypologiesPreview,
} from "@/lib/catalog/filter-entities";
import { Palette, Truck, Shield } from "lucide-react";
import type { HeroSlideWithRelations } from "@/types/database";

const HOME_PREVIEW_LIMIT = 6;

export default async function HomePage() {
  const settings = await getPublicSettings();
  let featuredItems: Awaited<ReturnType<typeof loadFeaturedItems>> = [];
  let slides: HeroSlideWithRelations[] = [];
  let groupsPreview: Awaited<ReturnType<typeof loadHomeGroupsPreview>> = [];
  let typologiesPreview: Awaited<ReturnType<typeof loadHomeTypologiesPreview>> = [];

  const supabase = await getPublicReadClient();
  if (supabase) {
    try {
      const [featuredRes, slidesRes, groupsRes, typologiesRes] = await Promise.all([
        loadFeaturedItems(supabase),
        supabase
          .from("hero_slides")
          .select("*, products(*, product_images(*), pin_sizes(*)), product_groups(*), product_typologies(*)")
          .eq("is_active", true)
          .order("sort_order"),
        loadHomeGroupsPreview(supabase, HOME_PREVIEW_LIMIT),
        loadHomeTypologiesPreview(supabase, HOME_PREVIEW_LIMIT),
      ]);
      featuredItems = featuredRes;
      slides = (slidesRes.data as unknown as HeroSlideWithRelations[]) || [];
      groupsPreview = groupsRes;
      typologiesPreview = typologiesRes;
    } catch {
      featuredItems = [];
      slides = [];
      groupsPreview = [];
      typologiesPreview = [];
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

      <ScrollReveal>
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl font-bold text-ink-900">
            In evidenza
          </h2>
          <p className="mt-2 text-ink-700">
            Prodotti, gruppi, tipologie e taglie selezionati per te.
          </p>
          <div className="mt-8">
            <FeaturedGrid items={featuredItems} />
          </div>
        </section>
      </ScrollReveal>

      {groupsPreview.length > 0 && (
        <ScrollReveal delayMs={80}>
          <section className="bg-white px-4 py-16">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-bold text-ink-900">Gruppi</h2>
                  <p className="mt-2 text-ink-700">Collezioni tematiche da esplorare.</p>
                </div>
                <Link
                  href="/gruppi"
                  className="text-sm font-semibold text-brand-600 transition-colors duration-300 hover:text-brand-700"
                >
                  Vedi tutti i gruppi
                </Link>
              </div>
              <div className="mt-8">
                <GroupGrid groups={groupsPreview} />
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {typologiesPreview.length > 0 && (
        <ScrollReveal delayMs={80}>
          <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold text-ink-900">Tipologie</h2>
                <p className="mt-2 text-ink-700">Sfoglia per anime, serie, film e altro.</p>
              </div>
              <Link
                href="/tipologie"
                className="text-sm font-semibold text-brand-600 transition-colors duration-300 hover:text-brand-700"
              >
                Vedi tutte le tipologie
              </Link>
            </div>
            <div className="mt-8">
              <TypologyGrid typologies={typologiesPreview} />
            </div>
          </section>
        </ScrollReveal>
      )}

      <ScrollReveal>
        <section className="bg-white px-4 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            <ScrollReveal delayMs={0} className="h-full">
              <div className="card-hover-lift h-full rounded-2xl border border-brand-100 p-6 text-center">
                <Palette className="mx-auto h-10 w-10 text-brand-500" />
                <h3 className="mt-4 font-bold text-ink-900">Design personalizzato</h3>
                <p className="mt-2 text-sm text-ink-600">
                  Carica la tua immagine e posizionala sulla spilla rotonda.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delayMs={120} className="h-full">
              <div className="card-hover-lift h-full rounded-2xl border border-brand-100 p-6 text-center">
                <Truck className="mx-auto h-10 w-10 text-brand-500" />
                <h3 className="mt-4 font-bold text-ink-900">Spedizione in Italia</h3>
                <p className="mt-2 text-sm text-ink-600">
                  Consegna rapida con tracking e supporto dedicato.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delayMs={240} className="h-full">
              <div className="card-hover-lift h-full rounded-2xl border border-brand-100 p-6 text-center">
                <Shield className="mx-auto h-10 w-10 text-brand-500" />
                <h3 className="mt-4 font-bold text-ink-900">Pagamento sicuro</h3>
                <p className="mt-2 text-sm text-ink-600">
                  Checkout protetto con PayPal.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl font-bold text-ink-900">FAQ</h2>
          <div className="mt-6 space-y-4">
            <details className="faq-item rounded-xl border border-brand-100 p-4">
              <summary className="cursor-pointer font-semibold">Che formati accettate?</summary>
              <p className="mt-2 text-sm text-ink-600">JPG, PNG e WebP fino a 15MB.</p>
            </details>
            <details className="faq-item rounded-xl border border-brand-100 p-4">
              <summary className="cursor-pointer font-semibold">Quanto tempo per la produzione?</summary>
              <p className="mt-2 text-sm text-ink-600">Di solito 3-7 giorni lavorativi dopo il pagamento.</p>
            </details>
          </div>
          <div className="mt-10 text-center">
            <Link href="/crea" className="btn-primary inline-block">
              Inizia ora
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
