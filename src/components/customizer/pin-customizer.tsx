"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { getCustomPrice } from "@/lib/orders/pricing-client";
import { prepareImageFromFile, waitForCanvasFrame } from "@/lib/images/prepare-upload-image";
import { FINISH_EFFECTS, getFinishOverlayStyle } from "@/lib/customizer/finish-effects";
import { useCart } from "@/lib/cart/cart-context";
import { ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-messages";
import type { CustomizationData, FinishEffect, Tables } from "@/types/database";
import { Loader2, RotateCw, ShoppingCart, Upload, ZoomIn, ZoomOut } from "lucide-react";
import toast from "react-hot-toast";
import {
  CustomizerDraftToolbar,
  readFileAsDataUrl,
} from "@/components/customizer/customizer-draft-toolbar";

type PinCustomizerProps = {
  sizes: Tables<"pin_sizes">[];
  ordersOpen?: boolean;
  previewFillColor?: string;
  previewStrokeColor?: string;
  loggedIn?: boolean;
  initialDraftId?: string | null;
};

const DEFAULT_CUSTOM: CustomizationData = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  finishEffect: "glossy",
};

function exportCanvasImage(canvas: HTMLCanvasElement): string {
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  if (!dataUrl || dataUrl.length < 200) {
    throw new Error("Errore generazione anteprima. Riprova a caricare l'immagine.");
  }
  return dataUrl;
}

export function PinCustomizer({
  sizes,
  ordersOpen = true,
  previewFillColor = "#ffe0ef",
  previewStrokeColor = "#f72585",
  loggedIn = false,
  initialDraftId = null,
}: PinCustomizerProps) {
  const { addCustomItem } = useCart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const originalFileRef = useRef<File | null>(null);

  const [selectedSizeId, setSelectedSizeId] = useState(sizes[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<CustomizationData>(DEFAULT_CUSTOM);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftLoading, setDraftLoading] = useState(Boolean(initialDraftId));

  const selectedSize = sizes.find((s) => s.id === selectedSizeId);
  const unitPrice = selectedSize ? getCustomPrice(selectedSize) : 0;
  const subtotal = unitPrice * quantity;
  const overlayStyle = getFinishOverlayStyle(customization.finishEffect);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 320;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = previewFillColor;
    ctx.fillRect(0, 0, size, size);

    if (img && imageLoaded) {
      ctx.save();
      ctx.translate(size / 2 + customization.offsetX, size / 2 + customization.offsetY);
      ctx.rotate((customization.rotation * Math.PI) / 180);
      ctx.scale(customization.scale, customization.scale);
      const drawSize = size * 0.9;
      ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      ctx.restore();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.strokeStyle = previewStrokeColor;
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [customization, imageLoaded, previewFillColor, previewStrokeColor]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (!initialDraftId) return;

    async function loadDraft() {
      setDraftLoading(true);
      try {
        const response = await fetch("/api/customizer/drafts/" + initialDraftId);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Bozza non trovata");

        const sourceUrl = data.sourceUrl as string | null;
        if (!sourceUrl) throw new Error("Immagine bozza non disponibile");

        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Errore caricamento bozza"));
          img.src = sourceUrl;
        });

        imageRef.current = img;
        originalFileRef.current = null;
        setSelectedSizeId(data.pin_size_id);
        setCustomization((data.customization_data as CustomizationData) || DEFAULT_CUSTOM);
        setImageLoaded(true);
        toast.success("Bozza caricata");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore bozza");
      } finally {
        setDraftLoading(false);
      }
    }

    loadDraft();
  }, [initialDraftId]);

  async function handleSaveDraft(name: string | null) {
    if (!imageLoaded || !imageRef.current) {
      throw new Error("Carica un immagine prima di salvare");
    }
    if (!selectedSizeId) {
      throw new Error("Seleziona una taglia");
    }

    setSavingDraft(true);
    try {
      drawCanvas();
      await waitForCanvasFrame();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Anteprima non disponibile");

      const previewBase64 = exportCanvasImage(canvas);
      let sourceBase64 = previewBase64;
      if (originalFileRef.current) {
        sourceBase64 = await readFileAsDataUrl(originalFileRef.current);
      }

      const response = await fetch("/api/customizer/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          pinSizeId: selectedSizeId,
          sourceBase64,
          previewBase64,
          customization,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore salvataggio");
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato non supportato. Usa JPG, PNG o WebP.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Immagine troppo grande. Max 15MB.");
      return;
    }

    setImageUploading(true);
    setImageLoaded(false);
    imageRef.current = null;
    originalFileRef.current = file;

    try {
      const img = await prepareImageFromFile(file);
      imageRef.current = img;
      setCustomization(DEFAULT_CUSTOM);
      setImageLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore caricamento immagine");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAddToCart() {
    if (!ordersOpen) {
      toast.error("Ordini temporaneamente chiusi");
      return;
    }
    if (!imageLoaded || !imageRef.current) {
      toast.error("Carica un'immagine per la tua spilla.");
      return;
    }
    if (!selectedSizeId || !selectedSize) {
      toast.error("Seleziona una taglia.");
      return;
    }

    setAdding(true);
    try {
      drawCanvas();
      await waitForCanvasFrame();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Anteprima non disponibile");

      const designBase64 = exportCanvasImage(canvas);

      const saved = addCustomItem({
        type: "custom",
        pinSizeId: selectedSizeId,
        pinSizeName: selectedSize.name,
        quantity,
        unitPrice,
        designBase64,
        customization,
        label: "Spilla personalizzata " + selectedSize.name,
      });

      if (!saved) {
        throw new Error("Impossibile salvare nel carrello. Prova con un'immagine piu leggera.");
      }

      toast.success("Aggiunta al carrello!");
      window.location.href = "/carrello";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="relative flex flex-col items-center rounded-3xl border border-brand-100 bg-white p-8 pin-shadow">
          {(imageUploading || draftLoading) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/80">
              <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
            </div>
          )}
          <div className="relative">
            <canvas ref={canvasRef} width={320} height={320} className="h-80 w-80 rounded-full" />
            {customization.finishEffect && customization.finishEffect !== "glossy" && imageLoaded && (
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={overlayStyle}
              />
            )}
          </div>
          <p className="mt-4 text-sm text-ink-400">
            Anteprima spilla {selectedSize?.name || ""}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled={imageUploading} onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Carica immagine
          </Button>
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, scale: Math.min(c.scale + 0.1, 3) }))}>
            <ZoomIn className="mr-2 h-4 w-4" />
            Zoom +
          </Button>
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, scale: Math.max(c.scale - 0.1, 0.3) }))}>
            <ZoomOut className="mr-2 h-4 w-4" />
            Zoom -
          </Button>
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, rotation: (c.rotation + 15) % 360 }))}>
            <RotateCw className="mr-2 h-4 w-4" />
            Ruota
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, offsetX: c.offsetX - 10 }))}>Sinistra</Button>
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, offsetX: c.offsetX + 10 }))}>Destra</Button>
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, offsetY: c.offsetY - 10 }))}>Su</Button>
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, offsetY: c.offsetY + 10 }))}>Giù</Button>
        </div>
      </div>

      <div className="space-y-6 rounded-3xl border border-brand-100 bg-white p-8">
        <h2 className="font-display text-2xl font-bold text-ink-900">Configura la spilla</h2>

        <p className="text-sm text-ink-700">
          Aggiungi piu spille al carrello prima di pagare.{" "}
          <Link href="/carrello" className="text-brand-600 underline">Vai al carrello</Link>
          {" · "}
          <Link href="/taglie" className="text-brand-600 underline">Confronta taglie</Link>
        </p>

        <CustomizerDraftToolbar
          loggedIn={loggedIn}
          saving={savingDraft}
          onSaveDraft={handleSaveDraft}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">Taglia spilla</label>
          <div className="grid gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setSelectedSizeId(size.id)}
                className={
                  "rounded-xl border px-4 py-3 text-left transition " +
                  (selectedSizeId === size.id ? "border-brand-500 bg-brand-50" : "border-ink-200")
                }
              >
                <span className="font-semibold">{size.name}</span>
                <span className="ml-2 text-brand-600">{formatPrice(getCustomPrice(size))}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">Effetto pellicola</label>
          <select
            value={customization.finishEffect || "glossy"}
            onChange={(e) =>
              setCustomization((c) => ({
                ...c,
                finishEffect: e.target.value as FinishEffect,
              }))
            }
            className="w-full rounded-xl border border-ink-200 px-4 py-2.5"
          >
            {FINISH_EFFECTS.map((fx) => (
              <option key={fx.value} value={fx.value}>{fx.label}</option>
            ))}
          </select>
        </div>

        <Input
          label="Quantita"
          type="number"
          min={1}
          max={50}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        />

        <div className="rounded-xl bg-brand-50 p-4">
          <div className="flex justify-between font-bold text-brand-600">
            <span>Totale riga</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>

        {!ordersOpen && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {ORDERS_CLOSED_MESSAGE}
          </div>
        )}

        {sizes.length === 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Nessuna taglia disponibile. Contatta il negozio.
          </div>
        )}

        <Button
          className="w-full"
          disabled={!ordersOpen || !imageLoaded || adding || sizes.length === 0}
          onClick={handleAddToCart}
        >
          {adding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Aggiunta...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Aggiungi al carrello
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
