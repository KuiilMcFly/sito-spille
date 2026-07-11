"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartPageClient() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center">
        <p className="text-ink-600">Il carrello e vuoto.</p>
        <Link href="/prodotti" className="mt-4 inline-block text-brand-600 hover:underline">
          Vai al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4"
        >
          {item.type === "custom" && item.designBase64 && (
            <img
              src={item.designBase64}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          {item.type === "catalog" && item.imageUrl && (
            <img
              src={item.imageUrl}
              alt=""
              className="h-16 w-16 rounded-xl object-cover"
            />
          )}
          <div className="flex-1 min-w-[200px]">
            <p className="font-semibold text-ink-900">
              {item.type === "custom" ? item.label : item.productName}
            </p>
            <p className="text-sm text-ink-500">
              {item.type === "custom" ? "Personalizzata" : "Catalogo"}
              {item.type === "custom" && " · " + item.pinSizeName}
            </p>
            <p className="text-sm text-brand-600">{formatPrice(item.unitPrice)} cad.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="rounded-lg border px-2 py-1 text-sm"
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="rounded-lg border px-2 py-1 text-sm"
            >
              +
            </button>
          </div>
          <p className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="text-sm text-red-500 hover:underline"
          >
            Rimuovi
          </button>
        </div>
      ))}

      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
        <div className="flex justify-between text-lg font-bold">
          <span>Subtotale</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-500">Spedizione calcolata al checkout</p>
        <Button className="mt-4 w-full" onClick={() => router.push("/checkout")}>
          Procedi al checkout
        </Button>
      </div>
    </div>
  );
}
