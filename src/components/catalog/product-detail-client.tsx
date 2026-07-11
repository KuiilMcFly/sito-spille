"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PayPalCheckout } from "@/components/payments/paypal-checkout";
import { formatPrice, getStorageUrl } from "@/lib/utils";
import { calcShippingCost } from "@/lib/orders/pricing-client";
import { ensureOrdersOpen } from "@/lib/orders/orders-open-client";
import { ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-messages";
import type { ProductWithImages, Tables } from "@/types/database";
import { Loader2, Package } from "lucide-react";
import toast from "react-hot-toast";

type ProductDetailProps = {
  product: ProductWithImages;
  shippingMethods: Tables<"shipping_methods">[];
  freeShippingThreshold: number;
  ordersOpen?: boolean;
  loggedInEmail?: string | null;
  loggedInPhone?: string | null;
  loggedInName?: string | null;
};

export function ProductDetailClient({
  product,
  shippingMethods,
  freeShippingThreshold,
  ordersOpen = true,
  loggedInEmail,
  loggedInPhone,
  loggedInName,
}: ProductDetailProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [shippingMethodId, setShippingMethodId] = useState(shippingMethods[0]?.id || "");
  const [email, setEmail] = useState(loggedInEmail || "");
  const [phone, setPhone] = useState(loggedInPhone || "");
  const [name, setName] = useState(loggedInName || "");
  const [notes, setNotes] = useState("");
  const [orderPreparing, setOrderPreparing] = useState(false);

  const primaryImage = product.product_images?.find((img) => img.is_primary);
  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethodId);
  const subtotal = product.price * quantity;
  const shippingCost = calcShippingCost(subtotal, selectedShipping?.price || 0, freeShippingThreshold);
  const total = subtotal + shippingCost;

  function validateCheckout(): boolean {
    if (!ordersOpen) {
      toast.error(ORDERS_CLOSED_MESSAGE);
      return false;
    }
    if (!email.trim() || !phone.trim()) {
      toast.error("Email e telefono sono obbligatori.");
      return false;
    }
    if (!shippingMethodId) {
      toast.error("Seleziona un metodo di spedizione.");
      return false;
    }
    return true;
  }

  async function prepareCatalogOrder() {
    if (!validateCheckout()) {
      throw new Error("Completa tutti i campi obbligatori");
    }

    setOrderPreparing(true);

    try {
      if (!(await ensureOrdersOpen())) {
        throw new Error(ORDERS_CLOSED_MESSAGE);
      }

      const response = await fetch("/api/orders/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          email: email.trim(),
          phone: phone.trim(),
          name,
          notes,
          shippingMethodId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore ordine");
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
    !ordersOpen || orderPreparing || !email.trim() || !phone.trim() || !shippingMethodId;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-3xl border border-brand-100 bg-brand-50">
        {primaryImage ? (
          <img
            src={getStorageUrl(primaryImage.storage_path)}
            alt={primaryImage.alt_text || product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <Package className="h-24 w-24" />
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900">{product.name}</h1>
        {product.pin_sizes && (
          <p className="mt-2 text-ink-400">Taglia: {product.pin_sizes.name}</p>
        )}
        <p className="mt-4 text-3xl font-bold text-brand-600">{formatPrice(product.price)}</p>
        {product.description && <p className="mt-6 text-ink-700">{product.description}</p>}

        <div className="mt-8 space-y-4 rounded-2xl border border-brand-100 bg-white p-6">
          <Input label="Quantità" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />

          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">Spedizione</label>
            <div className="grid gap-2">
              {shippingMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setShippingMethodId(method.id)}
                  className={
                    "rounded-xl border px-4 py-3 text-left text-sm transition " +
                    (shippingMethodId === method.id ? "border-brand-500 bg-brand-50" : "border-ink-200")
                  }
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">{method.name}</span>
                    <span className="text-brand-600">
                      {subtotal >= freeShippingThreshold ? "Gratis" : formatPrice(method.price)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {freeShippingThreshold > 0 && (
              <p className="mt-2 text-xs text-brand-600">
                Spedizione gratuita sopra {formatPrice(freeShippingThreshold)}
              </p>
            )}
          </div>

          <Input label="Email *" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Telefono *" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea label="Note" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="rounded-xl bg-brand-50 p-4">
            <div className="flex justify-between text-sm">
              <span>Subtotale</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Spedizione</span>
              <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
            </div>
            <div className="mt-2 flex justify-between font-bold text-brand-600">
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
            onPrepareOrder={prepareCatalogOrder}
            onPaid={(orderNumber) => {
              router.push("/pagamento/esito?status=success&order=" + orderNumber);
            }}
          />
        </div>
      </div>
    </div>
  );
}
