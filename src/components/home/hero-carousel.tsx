"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Tags } from "lucide-react";
import { getSiteAssetUrl } from "@/lib/utils";
import { parseHeroProductPosition } from "@/lib/hero/constants";
import type { HeroProductPosition } from "@/lib/hero/constants";
import { resolveHeroSlideContent } from "@/lib/hero/resolve-slide-content";
import type { HeroSlideWithRelations } from "@/types/database";

type HeroCarouselProps = {
  slides: HeroSlideWithRelations[];
  fallbackTitle: string;
  fallbackSubtitle: string;
};

const AUTOPLAY_MS = 6500;

function positionClass(position: HeroProductPosition): string {
  if (position === "left") return "justify-start";
  if (position === "right") return "justify-end";
  return "justify-center";
}

function contentEnterClass(direction: number): string {
  if (direction < 0) return "hero-content-enter-left";
  if (direction > 0) return "hero-content-enter-right";
  return "hero-content-enter";
}

export function HeroCarousel({ slides, fallbackTitle, fallbackSubtitle }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const [autoplayTick, setAutoplayTick] = useState(0);

  const resetAutoplay = useCallback(() => {
    setAutoplayTick((t) => t + 1);
  }, []);

  const goTo = useCallback(
    (nextIndex: number, dir: number) => {
      if (slides.length <= 1) return;
      setDirection(dir);
      setIndex(((nextIndex % slides.length) + slides.length) % slides.length);
      resetAutoplay();
    },
    [slides.length, resetAutoplay]
  );

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % slides.length);
    resetAutoplay();
  }, [slides.length, resetAutoplay]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + slides.length) % slides.length);
    resetAutoplay();
  }, [slides.length, resetAutoplay]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, paused, autoplayTick]);

  function handleTouchStart(clientX: number) {
    touchStartX.current = clientX;
    touchDeltaX.current = 0;
    setPaused(true);
  }

  function handleTouchMove(clientX: number) {
    touchDeltaX.current = clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    const delta = touchDeltaX.current;
    if (delta > 56) prev();
    else if (delta < -56) next();
    window.setTimeout(() => setPaused(false), 1200);
  }

  if (slides.length === 0) {
    return (
      <section className="hero-carousel gradient-hero px-4">
        <div className="hero-fallback-enter mx-auto flex h-full max-w-6xl flex-col items-center justify-center text-center">
          <h1 className="font-display mt-6 text-4xl font-bold leading-tight text-ink-900 md:text-6xl">
            {fallbackTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-700">{fallbackSubtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/crea" className="btn-primary">
              Crea la tua spilla
            </Link>
            <Link href="/prodotti" className="btn-secondary">
              Vedi catalogo
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[index];
  const content = resolveHeroSlideContent(slide);
  const ctaLabel = slide.cta_label || "Scopri";
  const position = parseHeroProductPosition(slide.product_position);
  const showBox =
    Boolean(content.kind) ||
    Boolean(content.title.trim()) ||
    Boolean(content.subtitle.trim());

  return (
    <section
      className="hero-carousel relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        if (touch) handleTouchStart(touch.clientX);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) handleTouchMove(touch.clientX);
      }}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((s, i) => {
        const isActive = i === index;
        const bgUrl = getSiteAssetUrl(s.background_path);
        const bgPosition = s.background_position || "50% 50%";
        return (
          <div
            key={s.id}
            className={
              "hero-slide-layer absolute inset-0 " + (isActive ? "hero-slide-layer-active" : "")
            }
            aria-hidden={!isActive}
          >
            <img
              src={bgUrl}
              alt=""
              className={
                "hero-slide-image absolute inset-0 h-full w-full object-cover " +
                (isActive ? "hero-slide-image-active" : "")
              }
              style={{ objectPosition: bgPosition }}
            />
          </div>
        );
      })}

      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/20 via-black/30 to-black/55" />

      {showBox && (
        <div
          className={
            "absolute inset-0 z-[3] mx-auto flex max-w-6xl items-center px-4 py-10 md:py-12 " +
            positionClass(position)
          }
        >
          <div
            key={slide.id + "-" + index}
            className={
              "hero-card " +
              (content.imageUrl || content.kind === "typology" ? "hero-card-with-media " : "") +
              contentEnterClass(direction)
            }
          >
            {content.imageUrl && (
              <div className="hero-card-media">
                <img
                  src={content.imageUrl}
                  alt={content.title}
                  className="hero-card-product-image"
                />
              </div>
            )}
            {!content.imageUrl && content.kind === "typology" && (
              <div className="hero-card-media hero-card-media-icon">
                <Tags className="h-12 w-12 text-brand-400 md:h-14 md:w-14" />
              </div>
            )}
            <div className="hero-card-body">
              {content.title && (
                <h1 className="hero-card-title">{content.title}</h1>
              )}
              {content.subtitle && (
                <p className="hero-card-subtitle">{content.subtitle}</p>
              )}
              {content.priceLabel && (
                <p className="hero-card-price">{content.priceLabel}</p>
              )}
              <Link href={content.href} className="btn-primary hero-card-cta">
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="hero-nav-btn absolute left-4 top-1/2 z-[4] -translate-y-1/2"
            aria-label="Slide precedente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="hero-nav-btn absolute right-4 top-1/2 z-[4] -translate-y-1/2"
            aria-label="Slide successiva"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-5 left-1/2 z-[4] flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i, i > index ? 1 : i < index ? -1 : 0)}
                className={
                  "hero-dot " + (i === index ? "hero-dot-active" : "")
                }
                aria-label={"Slide " + (i + 1)}
                aria-current={i === index ? "true" : undefined}
              >
                {i === index && !paused && (
                  <span
                    key={"progress-" + index}
                    className="hero-dot-progress"
                    style={{ animationDuration: AUTOPLAY_MS + "ms" }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
