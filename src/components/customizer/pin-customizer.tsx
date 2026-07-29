"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prepareImageFromFile, waitForCanvasFrame } from "@/lib/images/prepare-upload-image";
import { drawPinImageInCircle } from "@/lib/customizer/draw-pin-image";
import { FINISH_EFFECTS, getFinishOverlayStyle } from "@/lib/customizer/finish-effects";
import { ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-messages";
import {
  CheckoutAddressSection,
  EMPTY_SHIPPING_ADDRESS,
  validateShippingAddress,
} from "@/components/cart/checkout-address-section";
import type { ShippingAddressPayload } from "@/lib/addresses/types";
import type { CustomizationData, FinishEffect, Tables } from "@/types/database";
import { Loader2, PackageCheck, RotateCw, Upload, ZoomIn, ZoomOut } from "lucide-react";
import toast from "react-hot-toast";
import {
  CustomizerDraftToolbar,
  readFileAsDataUrl,
} from "@/components/customizer/customizer-draft-toolbar";
import { ensureOrdersOpen } from "@/lib/orders/orders-open-client";

type PinCustomizerProps = {
  sizes: Tables<"pin_sizes">[];
  ordersOpen?: boolean;
  previewFillColor?: string;
  previewStrokeColor?: string;
  loggedIn?: boolean;
  initialDraftId?: string | null;
  loggedInEmail?: string | null;
  loggedInPhone?: string | null;
  loggedInName?: string | null;
  savedAddresses?: Tables<"customer_addresses">[];
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
  loggedInEmail = null,
  loggedInPhone = null,
  loggedInName = null,
  savedAddresses = [],
}: PinCustomizerProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const originalFileRef = useRef<File | null>(null);

  const [selectedSizeId, setSelectedSizeId] = useState(sizes[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<CustomizationData>(DEFAULT_CUSTOM);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftLoading, setDraftLoading] = useState(Boolean(initialDraftId));
  const [email, setEmail] = useState(loggedInEmail || "");
  const [phone, setPhone] = useState(loggedInPhone || "");
  const [name, setName] = useState(loggedInName || "");
  const [notes, setNotes] = useState("");
  const defaultAddress = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    defaultAddress ? defaultAddress.id : "new"
  );
  const [saveAddress, setSaveAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressPayload>(EMPTY_SHIPPING_ADDRESS);

  const selectedSize = sizes.find((s) => s.id === selectedSizeId);
  const overlayStyle = getFinishOverlayStyle(customization.finishEffect);

  useEffect(() => {
    if (!defaultAddress) return;
    setShippingAddress({
      label: defaultAddress.label,
      fullName: defaultAddress.full_name || undefined,
      phone: defaultAddress.phone || undefined,
      streetLine1: defaultAddress.street_line1,
      streetLine2: defaultAddress.street_line2 || undefined,
      city: defaultAddress.city,
      province: defaultAddress.province,
      postalCode: defaultAddress.postal_code,
      country: defaultAddress.country,
    });
  }, [defaultAddress?.id]);

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
      drawPinImageInCircle(ctx, img, customization, size);
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

  async function handleSubmitOrder() {
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
    if (!email.trim() || !phone.trim()) {
      toast.error("Email e telefono obbligatori");
      return;
    }
    if (!validateShippingAddress(shippingAddress)) {
      toast.error("Compila l'indirizzo di spedizione");
      return;
    }

    setSubmitting(true);
    try {
      if (!(await ensureOrdersOpen())) {
        throw new Error(ORDERS_CLOSED_MESSAGE);
      }

      drawCanvas();
      await waitForCanvasFrame();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Anteprima non disponibile");

      const designBase64 = exportCanvasImage(canvas);

      const response = await fetch("/api/orders/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pinSizeId: selectedSizeId,
          quantity,
          email: email.trim(),
          phone: phone.trim(),
          name: name.trim() || null,
          notes: notes.trim() || null,
          customization,
          designBase64,
          shippingAddress,
          shippingAddressId: selectedAddressId !== "new" ? selectedAddressId : null,
          saveAddress: loggedIn && selectedAddressId === "new" ? saveAddress : false,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore invio ordine");

      toast.success("Ordine inviato!");
      router.push("/ordine/" + data.orderNumber);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore");
    } finally {
      setSubmitting(false);
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
          <p className="mt-1 max-w-xs text-center text-xs text-ink-500">
            L&apos;immagine mantiene le proporzioni: usa zoom e spostamento per tagliarla nel cerchio.
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
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization(DEFAULT_CUSTOM)}>
            Ripristina posizione
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
        <h2 className="font-display text-2xl font-bold text-ink-900">Configura e invia ordine</h2>

        <p className="text-sm text-ink-700">
          Completa la personalizzazione e invia l&apos;ordine: ti contatteremo per il pagamento.{" "}
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
                {size.diameter_mm ? (
                  <span className="ml-2 text-sm text-ink-500">{size.diameter_mm} mm</span>
                ) : null}
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

        <Input label="Email *" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Telefono *" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />

        <CheckoutAddressSection
          loggedIn={loggedIn}
          initialAddresses={savedAddresses}
          shippingAddress={shippingAddress}
          setShippingAddress={setShippingAddress}
          selectedAddressId={selectedAddressId}
          setSelectedAddressId={setSelectedAddressId}
          saveAddress={saveAddress}
          setSaveAddress={setSaveAddress}
        />

        <Textarea label="Note" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

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
          disabled={
            !ordersOpen ||
            !imageLoaded ||
            submitting ||
            sizes.length === 0 ||
            !email.trim() ||
            !phone.trim() ||
            !validateShippingAddress(shippingAddress)
          }
          onClick={handleSubmitOrder}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Invio ordine...
            </>
          ) : (
            <>
              <PackageCheck className="mr-2 h-4 w-4" />
              Invia ordine personalizzato
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
