"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, getStorageUrl, getSiteAssetUrl } from "@/lib/utils";
import type { HeroSlideWithProduct } from "@/types/database";

type HeroCarouselProps = {
  slides: HeroSlideWithProduct[];
  fallbackTitle: string;
  fallbackSubtitle: string;
};

export function HeroCarousel({ slides, fallbackTitle, fallbackSubtitle }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [slides.length, next]);

  if (slides.length === 0) {
    return (
      <section className="gradient-hero px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="font-display mt-6 text-4xl font-bold leading-tight text-ink-900 md:text-6xl">
            {fallbackTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-700">{fallbackSubtitle}</p>
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
    );
  }

  const slide = slides[index];
  const product = slide.products;
  const primaryImage = product?.product_images?.find((img) => img.is_primary);
  const productImageUrl = primaryImage ? getStorageUrl(primaryImage.storage_path) : null;
  const bgUrl = getSiteAssetUrl(slide.background_path);
  const title = slide.title_override || product?.name || "";
  const subtitle = slide.subtitle_override || product?.description || "";
  const ctaLabel = slide.cta_label || "Scopri";
  const productHref = product ? "/prodotti/" + product.slug : "/prodotti";

  return (
    <section className="relative min-h-[420px] overflow-hidden md:min-h-[520px]">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: "url(" + bgUrl + ")" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
      <div className="relative mx-auto flex max-w-6xl items-center gap-8 px-4 py-16 md:py-24">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-ink-900 md:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mt-4 max-w-lg text-lg text-ink-700 line-clamp-3">{subtitle}</p>
          )}
          {product && (
            <p className="mt-2 text-xl font-semibold text-brand-600">
              {formatPrice(product.price)}
            </p>
          )}
          <Link
            href={productHref}
            className="mt-6 inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-600"
          >
            {ctaLabel}
          </Link>
        </div>
        {productImageUrl && (
          <div className="hidden flex-shrink-0 md:block">
            <img
              src={productImageUrl}
              alt={product?.name || ""}
              className="h-64 w-64 rounded-full object-cover shadow-2xl ring-4 ring-white"
            />
          </div>
        )}
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
            aria-label="Slide precedente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
            aria-label="Slide successiva"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={
                  "h-2 w-2 rounded-full transition " +
                  (i === index ? "bg-brand-500 w-6" : "bg-ink-300")
                }
                aria-label={"Slide " + (i + 1)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
