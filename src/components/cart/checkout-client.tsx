"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PayPalCheckout } from "@/components/payments/paypal-checkout";
import {
  CheckoutAddressSection,
  EMPTY_SHIPPING_ADDRESS,
  validateShippingAddress,
} from "@/components/cart/checkout-address-section";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/utils";
import { ensureOrdersOpen } from "@/lib/orders/orders-open-client";
import { ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-messages";
import type { ShippingAddressPayload } from "@/lib/addresses/types";
import type { Tables } from "@/types/database";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type CheckoutClientProps = {
  shippingMethods: Tables<"shipping_methods">[];
  freeShippingThreshold: number;
  ordersOpen?: boolean;
  loggedInEmail?: string | null;
  loggedInPhone?: string | null;
  loggedInName?: string | null;
  loggedIn?: boolean;
  savedAddresses?: Tables<"customer_addresses">[];
};

export function CheckoutClient({
  shippingMethods,
  freeShippingThreshold,
  ordersOpen = true,
  loggedInEmail,
  loggedInPhone,
  loggedInName,
  loggedIn = false,
  savedAddresses = [],
}: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [shippingMethodId, setShippingMethodId] = useState(shippingMethods[0]?.id || "");
  const [email, setEmail] = useState(loggedInEmail || "");
  const [phone, setPhone] = useState(loggedInPhone || "");
  const [name, setName] = useState(loggedInName || "");
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [freeShippingPromo, setFreeShippingPromo] = useState(false);
  const [promotionName, setPromotionName] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [orderPreparing, setOrderPreparing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressPayload>(EMPTY_SHIPPING_ADDRESS);
  const defaultAddress = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    defaultAddress ? defaultAddress.id : "new"
  );
  const [saveAddress, setSaveAddress] = useState(false);

  useEffect(() => {
    if (defaultAddress) {
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
    }
  }, [defaultAddress?.id]);

  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethodId);
  const baseShippingCost = selectedShipping?.price || 0;
  const shippingCost =
    freeShippingPromo || subtotal - discountAmount >= freeShippingThreshold
      ? 0
      : baseShippingCost;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const total = discountedSubtotal + shippingCost;

  function buildCheckoutItems() {
    return items.map((item) => {
      if (item.type === "custom") {
        return {
          type: "custom",
          pinSizeId: item.pinSizeId,
          quantity: item.quantity,
          designBase64: item.designBase64,
          customization: item.customization,
        };
      }
      return {
        type: "catalog",
        productId: item.productId,
        quantity: item.quantity,
      };
    });
  }

  async function refreshPromotion(codeOverride?: string) {
    if (items.length === 0) return;
    setPromoLoading(true);
    try {
      const response = await fetch("/api/promotions/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode: codeOverride !== undefined ? codeOverride : promoCode,
          items: buildCheckoutItems(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore promo");
      setDiscountAmount(data.discountAmount || 0);
      setFreeShippingPromo(Boolean(data.freeShipping));
      setPromotionName(data.promotionName || null);
    } catch {
      setDiscountAmount(0);
      setFreeShippingPromo(false);
      setPromotionName(null);
    } finally {
      setPromoLoading(false);
    }
  }

  useEffect(() => {
    refreshPromotion("");
  }, [items, subtotal]);

  async function applyPromoCode() {
    if (items.length === 0) return;
    setPromoLoading(true);
    try {
      const response = await fetch("/api/promotions/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode: promoCode,
          items: buildCheckoutItems(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore promo");
      setDiscountAmount(data.discountAmount || 0);
      setFreeShippingPromo(Boolean(data.freeShipping));
      setPromotionName(data.promotionName || null);
      if (data.promotionName || data.discountAmount > 0 || data.freeShipping) {
        toast.success("Codice applicato");
      } else {
        toast.error("Codice non valido o non applicabile");
      }
    } catch {
      toast.error("Codice non valido");
    } finally {
      setPromoLoading(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-ink-600">Il carrello e vuoto.</p>;
  }

  async function prepareOrder() {
    if (!ordersOpen) {
      toast.error(ORDERS_CLOSED_MESSAGE);
      throw new Error(ORDERS_CLOSED_MESSAGE);
    }
    if (!email.trim() || !phone.trim()) {
      toast.error("Email e telefono obbligatori");
      throw new Error("Dati mancanti");
    }
    if (!shippingMethodId) {
      toast.error("Seleziona spedizione");
      throw new Error("Spedizione mancante");
    }
    if (!validateShippingAddress(shippingAddress)) {
      toast.error("Compila l indirizzo di spedizione");
      throw new Error("Indirizzo mancante");
    }

    setOrderPreparing(true);
    try {
      if (!(await ensureOrdersOpen())) {
        throw new Error(ORDERS_CLOSED_MESSAGE);
      }

      const payload = {
        email: email.trim(),
        phone: phone.trim(),
        name: name.trim(),
        notes: notes.trim(),
        shippingMethodId,
        promotionCode: promoCode.trim() || null,
        items: buildCheckoutItems(),
        shippingAddress,
        shippingAddressId: selectedAddressId !== "new" ? selectedAddressId : null,
        saveAddress: loggedIn && selectedAddressId === "new" ? saveAddress : false,
      };

      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore ordine");

      return {
        orderId: data.orderId as string,
        orderNumber: data.orderNumber as string,
      };
    } finally {
      setOrderPreparing(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold">Riepilogo ({items.length} righe)</h2>
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-brand-100 p-3 text-sm">
            <p className="font-semibold">
              {item.type === "custom" ? item.label : item.productName}
            </p>
            <p className="text-ink-500">
              x{item.quantity} · {formatPrice(item.unitPrice * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-brand-100 bg-white p-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Spedizione</label>
          <div className="grid gap-2">
            {shippingMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setShippingMethodId(method.id)}
                className={
                  "rounded-xl border px-4 py-3 text-left text-sm " +
                  (shippingMethodId === method.id ? "border-brand-500 bg-brand-50" : "border-ink-200")
                }
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{method.name}</span>
                  <span>
                    {subtotal >= freeShippingThreshold ? "Gratis" : formatPrice(method.price)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

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

        <div>
          <label className="mb-2 block text-sm font-medium">Codice sconto</label>
          <div className="flex gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm"
              placeholder="CODICE"
            />
            <button
              type="button"
              onClick={applyPromoCode}
              disabled={promoLoading || !promoCode.trim()}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Applica
            </button>
          </div>
          {promotionName && (
            <p className="mt-2 text-xs text-brand-600">Promo: {promotionName}</p>
          )}
        </div>

        <div className="rounded-xl bg-brand-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotale</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Sconto</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Spedizione</span>
            <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between font-bold text-brand-600 text-base">
            <span>Totale</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {orderPreparing && (
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creazione ordine...
          </div>
        )}

        <PayPalCheckout
          disabled={
            !ordersOpen ||
            orderPreparing ||
            !email.trim() ||
            !phone.trim() ||
            !validateShippingAddress(shippingAddress)
          }
          ordersOpen={ordersOpen}
          onPrepareOrder={prepareOrder}
          onPaid={(orderNumber) => {
            clearCart();
            router.push("/pagamento/esito?status=success&order=" + orderNumber);
          }}
        />
      </div>
    </div>
  );
}
