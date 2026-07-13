"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField, type ImageUploadMeta } from "@/components/admin/image-upload-field";
import { getSiteAssetUrl } from "@/lib/utils";
import { HERO_PRODUCT_POSITIONS, parseHeroProductPosition } from "@/lib/hero/constants";
import type { HeroProductPosition } from "@/lib/hero/constants";
import { formatSiteAssetMaxSize } from "@/lib/images/content-type";
import { uploadSiteAssetClient } from "@/lib/site-assets/upload-client";
import { DeleteResourceButton } from "@/components/admin/delete-resource-button";
import type { Tables } from "@/types/database";
import toast from "react-hot-toast";

type HeroSlideFormProps = {
  slide?: Tables<"hero_slides">;
  products: Tables<"products">[];
  groups: Tables<"product_groups">[];
  typologies: Tables<"product_typologies">[];
};

export function HeroSlideForm({ slide, products, groups, typologies }: HeroSlideFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(slide?.product_id || "");
  const [groupId, setGroupId] = useState(slide?.product_group_id || "");
  const [typologyId, setTypologyId] = useState(slide?.product_typology_id || "");
  const [productPosition, setProductPosition] = useState<HeroProductPosition>(
    parseHeroProductPosition(slide?.product_position)
  );
  const [titleOverride, setTitleOverride] = useState(slide?.title_override || "");
  const [subtitleOverride, setSubtitleOverride] = useState(slide?.subtitle_override || "");
  const [ctaLabel, setCtaLabel] = useState(slide?.cta_label || "Scopri");
  const [sortOrder, setSortOrder] = useState(String(slide?.sort_order || 0));
  const [isActive, setIsActive] = useState(slide?.is_active ?? true);
  const [background, setBackground] = useState<File | null>(null);
  const [backgroundPosition, setBackgroundPosition] = useState(
    slide?.background_position || "50% 50%"
  );
  const [loading, setLoading] = useState(false);

  function handleProductChange(value: string) {
    setProductId(value);
    if (value) {
      setGroupId("");
      setTypologyId("");
    }
  }

  function handleGroupChange(value: string) {
    setGroupId(value);
    if (value) {
      setProductId("");
      setTypologyId("");
    }
  }

  function handleTypologyChange(value: string) {
    setTypologyId(value);
    if (value) {
      setProductId("");
      setGroupId("");
    }
  }

  function handleBackgroundChange(file: File | null, meta?: ImageUploadMeta) {
    if (file) setBackground(file);
    if (meta?.objectPosition) setBackgroundPosition(meta.objectPosition);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!slide && !background) {
      toast.error("Background obbligatorio");
      return;
    }

    setLoading(true);

    let backgroundPath: string | undefined;
    if (background) {
      const uploadToast = toast.loading("Upload immagine in corso...");
      const upload = await uploadSiteAssetClient(background, "hero");
      toast.dismiss(uploadToast);

      if (!upload.ok) {
        toast.error(upload.error);
        setLoading(false);
        return;
      }

      backgroundPath = upload.path;
    }

    const payload = {
      productId: productId || null,
      groupId: groupId || null,
      typologyId: typologyId || null,
      productPosition,
      titleOverride,
      subtitleOverride,
      ctaLabel,
      sortOrder,
      isActive,
      backgroundPath,
      backgroundPosition,
    };

    const url = slide ? "/api/admin/hero-slides/" + slide.id : "/api/admin/hero-slides";
    const method = slide ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      toast.error(data.error || "Errore salvataggio");
      setLoading(false);
      return;
    }

    toast.success(slide ? "Slide aggiornata" : "Slide creata");
    router.push("/admin/hero");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-4 rounded-xl border border-ink-700 bg-ink-900/40 p-4">
        <p className="text-sm font-medium text-ink-200">Elemento in evidenza</p>
        <p className="text-xs text-ink-500">
          Scegli un solo elemento tra prodotto, gruppo o tipologia. Selezionarne uno svuota gli altri.
        </p>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Prodotto</label>
          <select
            value={productId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
          >
            <option value="">Nessun prodotto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Gruppo</label>
          <select
            value={groupId}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
          >
            <option value="">Nessun gruppo</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Tipologia</label>
          <select
            value={typologyId}
            onChange={(e) => handleTypologyChange(e.target.value)}
            className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
          >
            <option value="">Nessuna tipologia</option>
            {typologies.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-ink-500">
          Lascia tutto vuoto per mostrare solo lo sfondo, oppure usa titolo e sottotitolo personalizzati.
        </p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-200">Posizione in evidenza</label>
        <select
          value={productPosition}
          onChange={(e) => setProductPosition(parseHeroProductPosition(e.target.value))}
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
        >
          {HERO_PRODUCT_POSITIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-ink-500">
          Sinistra, centro o destra per il box di prodotto, gruppo o tipologia.
        </p>
      </div>
      <ImageUploadField
        label="Background hero"
        required={!slide}
        aspectRatio="hero"
        allowKeepOriginal
        objectPosition={backgroundPosition}
        currentUrl={slide?.background_path ? getSiteAssetUrl(slide.background_path) : null}
        onChange={handleBackgroundChange}
        onPositionOnly={(meta) => {
          if (meta.objectPosition) setBackgroundPosition(meta.objectPosition);
        }}
      />
      <p className="text-xs text-ink-500">
        Supportati JPEG, PNG, GIF, WebP animato e altri formati immagine fino a {formatSiteAssetMaxSize()}.
      </p>
      <Input label="Titolo override" value={titleOverride} onChange={(e) => setTitleOverride(e.target.value)} />
      <Input label="Sottotitolo override" value={subtitleOverride} onChange={(e) => setSubtitleOverride(e.target.value)} />
      <Input label="Testo pulsante" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
      <Input label="Ordine" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Attiva
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva"}
        </Button>
        {slide && (
          <DeleteResourceButton
            apiUrl={"/api/admin/hero-slides/" + slide.id}
            redirectTo="/admin/hero"
            resourceLabel="questa slide hero"
          />
        )}
      </div>
    </form>
  );
}
