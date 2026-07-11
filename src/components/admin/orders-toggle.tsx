"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ShoppingBag, Lock } from "lucide-react";

type OrdersToggleProps = {
  initialOpen: boolean;
};

export function OrdersToggle({ initialOpen }: OrdersToggleProps) {
  const [ordersOpen, setOrdersOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);

  async function toggleOrders() {
    const nextOpen = !ordersOpen;
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "orders_open",
          value: { open: nextOpen },
        }),
      });

      if (!response.ok) {
        throw new Error("Errore salvataggio");
      }

      setOrdersOpen(nextOpen);
      toast.success(
        nextOpen
          ? "Ordini riaperti: i clienti possono acquistare"
          : "Ordini chiusi: i clienti non possono più ordinare"
      );
    } catch {
      toast.error("Impossibile aggiornare lo stato ordini");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg rounded-xl border border-ink-700 bg-ink-800 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Stato ordini</h2>
          <p className="mt-1 text-sm text-ink-400">
            Chiudi temporaneamente gli ordini quando non puoi accettare nuove richieste.
          </p>
        </div>
        {ordersOpen ? (
          <ShoppingBag className="h-6 w-6 shrink-0 text-emerald-400" />
        ) : (
          <Lock className="h-6 w-6 shrink-0 text-amber-400" />
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span
          className={
            "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
            (ordersOpen
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-amber-500/20 text-amber-300")
          }
        >
          {ordersOpen ? "Ordini aperti" : "Ordini chiusi"}
        </span>
      </div>

      <p className="mt-4 text-sm text-ink-300">
        {ordersOpen
          ? "I clienti possono completare ordini dal customizer e dal catalogo."
          : "I clienti vedranno un messaggio di errore se provano a ordinare."}
      </p>

      <Button
        type="button"
        variant={ordersOpen ? "outline" : "primary"}
        className="mt-5"
        disabled={loading}
        onClick={toggleOrders}
      >
        {loading
          ? "Aggiornamento..."
          : ordersOpen
            ? "Chiudi ordini"
            : "Riapri ordini"}
      </Button>
    </div>
  );
}
