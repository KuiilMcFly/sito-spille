"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PayPalCheckout } from "@/components/payments/paypal-checkout";
import { formatPrice } from "@/lib/utils";
import { getCustomPrice } from "@/lib/orders/pricing-client";
import { prepareImageFromFile, waitForCanvasFrame } from "@/lib/images/prepare-upload-image";
import { ensureOrdersOpen } from "@/lib/orders/orders-open-client";
import { ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-messages";
import type { CustomizationData, Tables } from "@/types/database";
import { Loader2, RotateCw, Upload, ZoomIn, ZoomOut } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

type ShippingMethod = Tables<"shipping_methods">;

type PinCustomizerProps = {
  sizes: Tables<"pin_sizes">[];
  shippingMethods: ShippingMethod[];
  freeShippingThreshold: number;
  ordersOpen?: boolean;
  previewFillColor?: string;
  previewStrokeColor?: string;
  loggedInEmail?: string | null;
  loggedInPhone?: string | null;
  loggedInName?: string | null;
};

const DEFAULT_CUSTOM: CustomizationData = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function PinCustomizer({
  sizes,
  shippingMethods,
  freeShippingThreshold,
  ordersOpen = true,
  previewFillColor = "#ffe0ef",
  previewStrokeColor = "#f72585",
  loggedInEmail,
  loggedInPhone,
  loggedInName,
}: PinCustomizerProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [selectedSizeId, setSelectedSizeId] = useState(sizes[0]?.id || "");
  const [shippingMethodId, setShippingMethodId] = useState(shippingMethods[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<CustomizationData>(DEFAULT_CUSTOM);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [orderPreparing, setOrderPreparing] = useState(false);
  const [email, setEmail] = useState(loggedInEmail || "");
  const [phone, setPhone] = useState(loggedInPhone || "");
  const [name, setName] = useState(loggedInName || "");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (loggedInEmail) setEmail(loggedInEmail);
    if (loggedInPhone) setPhone(loggedInPhone);
    if (loggedInName) setName(loggedInName);
  }, [loggedInEmail, loggedInPhone, loggedInName]);

  const selectedSize = sizes.find((s) => s.id === selectedSizeId);
  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethodId);
  const unitPrice = selectedSize ? getCustomPrice(selectedSize) : 0;
  const subtotal = unitPrice * quantity;
  const shippingCost =
    subtotal >= freeShippingThreshold ? 0 : selectedShipping?.price || 0;
  const total = subtotal + shippingCost;

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

    try {
      const img = await prepareImageFromFile(file);
      imageRef.current = img;
      setCustomization(DEFAULT_CUSTOM);
      setImageLoaded(true);
      if (img.width < 500 || img.height < 500) {
        toast("Consigliamo immagini di almeno 500x500px per una stampa nitida.", {
          icon: "i",
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore caricamento immagine");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function validateCheckout(): boolean {
    if (!ordersOpen) {
      toast.error(ORDERS_CLOSED_MESSAGE);
      return false;
    }
    if (!imageLoaded) {
      toast.error("Carica un'immagine per la tua spilla.");
      return false;
    }
    if (!selectedSizeId) {
      toast.error("Seleziona una taglia.");
      return false;
    }
    if (!shippingMethodId) {
      toast.error("Seleziona un metodo di spedizione.");
      return false;
    }
    if (!email.trim() || !phone.trim()) {
      toast.error("Email e telefono sono obbligatori.");
      return false;
    }
    return true;
  }

  async function prepareCustomOrder() {
    if (!validateCheckout()) {
      throw new Error("Completa tutti i campi obbligatori");
    }

    setOrderPreparing(true);

    try {
      if (!(await ensureOrdersOpen())) {
        throw new Error(ORDERS_CLOSED_MESSAGE);
      }

      drawCanvas();
      await waitForCanvasFrame();

      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Anteprima non disponibile");
      }

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), "image/jpeg", 0.92);
      });

      if (!blob || blob.size === 0) {
        throw new Error("Errore generazione anteprima. Riprova.");
      }

      const designBase64 = await blobToBase64(blob);

      const response = await fetch("/api/orders/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designBase64,
          pinSizeId: selectedSizeId,
          shippingMethodId,
          quantity,
          email: email.trim(),
          phone: phone.trim(),
          name: name.trim(),
          notes: notes.trim(),
          customization: JSON.stringify(customization),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore creazione ordine");
      }

      return {
        orderId: data.orderId as string,
        orderNumber: data.orderNumber as string,
      };
    } finally {
      setOrderPreparing(false);
    }
  }

  const checkoutDisabled =
    !ordersOpen ||
    !imageLoaded ||
    imageUploading ||
    orderPreparing ||
    !email.trim() ||
    !phone.trim();

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="relative flex flex-col items-center rounded-3xl border border-brand-100 bg-white p-8 pin-shadow">
          {imageUploading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/80">
              <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
              <p className="mt-3 text-sm text-ink-600">Caricamento immagine...</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="h-80 w-80 rounded-full"
            style={{ maxWidth: "100%" }}
          />
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
          <Button
            type="button"
            variant="outline"
            disabled={imageUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {imageUploading ? "Caricamento..." : "Carica immagine"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!imageLoaded || imageUploading}
            onClick={() =>
              setCustomization((c) => ({ ...c, scale: Math.min(c.scale + 0.1, 3) }))
            }
          >
            <ZoomIn className="mr-2 h-4 w-4" />
            Zoom +
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!imageLoaded || imageUploading}
            onClick={() =>
              setCustomization((c) => ({ ...c, scale: Math.max(c.scale - 0.1, 0.3) }))
            }
          >
            <ZoomOut className="mr-2 h-4 w-4" />
            Zoom -
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!imageLoaded || imageUploading}
            onClick={() =>
              setCustomization((c) => ({ ...c, rotation: (c.rotation + 15) % 360 }))
            }
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Ruota
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, offsetX: c.offsetX - 10 }))}>
            Sinistra
          </Button>
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, offsetX: c.offsetX + 10 }))}>
            Destra
          </Button>
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, offsetY: c.offsetY - 10 }))}>
            Su
          </Button>
          <Button type="button" variant="ghost" disabled={!imageLoaded} onClick={() => setCustomization((c) => ({ ...c, offsetY: c.offsetY + 10 }))}>
            Giù
          </Button>
        </div>
      </div>

      <div className="space-y-6 rounded-3xl border border-brand-100 bg-white p-8">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          Configura il tuo ordine
        </h2>

        {!loggedInEmail && (
          <p className="text-sm text-ink-700">
            Hai un account?{" "}
            <Link href="/accedi?redirect=/crea" className="text-brand-600 underline">
              Accedi
            </Link>{" "}
            per salvare i tuoi ordini.
          </p>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">
            Taglia spilla
          </label>
          <div className="grid gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setSelectedSizeId(size.id)}
                className={
                  "rounded-xl border px-4 py-3 text-left transition " +
                  (selectedSizeId === size.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-ink-200 hover:border-brand-300")
                }
              >
                <span className="font-semibold">{size.name}</span>
                <span className="ml-2 text-brand-600">
                  {formatPrice(getCustomPrice(size))}
                </span>
                {size.description && (
                  <p className="text-xs text-ink-400">{size.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">
            Metodo di spedizione
          </label>
          <div className="grid gap-2">
            {shippingMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setShippingMethodId(method.id)}
                className={
                  "rounded-xl border px-4 py-3 text-left transition " +
                  (shippingMethodId === method.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-ink-200 hover:border-brand-300")
                }
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{method.name}</span>
                  <span className="text-brand-600">
                    {subtotal >= freeShippingThreshold
                      ? "Gratis"
                      : formatPrice(method.price)}
                  </span>
                </div>
                {method.description && (
                  <p className="mt-1 text-xs text-ink-400">{method.description}</p>
                )}
                {method.estimated_days && (
                  <p className="text-xs text-ink-400">{method.estimated_days}</p>
                )}
              </button>
            ))}
          </div>
          {freeShippingThreshold > 0 && (
            <p className="mt-2 text-xs text-brand-600">
              Spedizione gratuita sopra {formatPrice(freeShippingThreshold)}
            </p>
          )}
        </div>

        <Input
          label="Quantità"
          type="number"
          min={1}
          max={50}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        />

        <Input label="Email *" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Telefono *" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Nome (opzionale)" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="Note (opzionale)" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="rounded-xl bg-brand-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotale</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Spedizione</span>
            <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-brand-600">
            <span>Totale</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {orderPreparing && (
          <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-ink-700">
            <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
            Preparazione ordine in corso...
          </div>
        )}

        {!ordersOpen && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {ORDERS_CLOSED_MESSAGE}
          </div>
        )}

        <PayPalCheckout
          disabled={checkoutDisabled}
          ordersOpen={ordersOpen}
          onPrepareOrder={prepareCustomOrder}
          onPaid={(orderNumber) => {
            router.push("/pagamento/esito?status=success&order=" + orderNumber);
          }}
        />
      </div>
    </div>
  );
}
