"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, getOrderStatusVariant } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/utils";

type OrderLookupProps = {
  orderNumber: string;
};

export function OrderLookup({ orderNumber }: OrderLookupProps) {
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(
      "/api/orders/lookup?orderNumber=" +
        encodeURIComponent(orderNumber) +
        "&email=" +
        encodeURIComponent(email)
    );
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Ordine non trovato");
      setOrder(null);
    } else {
      setOrder(data.order);
    }
    setLoading(false);
  }

  return (
    <div>
      {!order && (
        <form onSubmit={handleLookup} className="mx-auto max-w-md space-y-4">
          <p className="text-ink-700">
            Inserisci l&apos;email usata per l&apos;ordine <strong>{orderNumber}</strong>
          </p>
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Ricerca..." : "Visualizza ordine"}
          </Button>
        </form>
      )}

      {order && (
        <div className="rounded-2xl border border-brand-100 bg-white p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">{orderNumber}</h2>
            <Badge variant={getOrderStatusVariant(order.status as string)}>
              {ORDER_STATUS_LABELS[order.status as string] || (order.status as string)}
            </Badge>
          </div>
          <p className="mt-4 text-ink-700">
            Totale: <strong>{formatPrice(order.total_amount as number)}</strong>
          </p>
          <p className="text-sm text-ink-400">
            Creato il {new Date(order.created_at as string).toLocaleDateString("it-IT")}
          </p>
        </div>
      )}
    </div>
  );
}
