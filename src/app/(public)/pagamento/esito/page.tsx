"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const token = searchParams.get("token");
  const orderFromQuery = searchParams.get("order");
  const [orderNumber, setOrderNumber] = useState<string | null>(orderFromQuery);
  const [loading, setLoading] = useState(status === "success" && !!token && !orderFromQuery);

  useEffect(() => {
    if (orderFromQuery) {
      setOrderNumber(orderFromQuery);
      setLoading(false);
      return;
    }

    if (status === "success" && token) {
      fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalOrderId: token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.orderNumber) setOrderNumber(data.orderNumber);
        })
        .finally(() => setLoading(false));
    }
  }, [status, token, orderFromQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
        <p className="mt-4 text-ink-700">Conferma pagamento in corso...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <CheckCircle className="h-16 w-16 text-emerald-500" />
        <h1 className="font-display mt-6 text-3xl font-bold text-ink-900">
          Pagamento completato!
        </h1>
        {orderNumber && (
          <p className="mt-2 text-ink-700">
            Ordine: <strong>{orderNumber}</strong>
          </p>
        )}
        <p className="mt-4 text-ink-700">
          Riceverai una email di conferma a breve.
        </p>
        {orderNumber && (
          <Link href={"/ordine/" + orderNumber} className="mt-6">
            <Button variant="outline">Traccia ordine</Button>
          </Link>
        )}
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <XCircle className="h-16 w-16 text-amber-500" />
        <h1 className="font-display mt-6 text-3xl font-bold text-ink-900">
          Pagamento annullato
        </h1>
        <p className="mt-4 text-ink-700">
          Puoi riprovare quando vuoi dal customizer o dal catalogo.
        </p>
        <Link href="/crea" className="mt-6">
          <Button>Torna al customizer</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 text-center">
      <p className="text-ink-700">Esito pagamento non disponibile.</p>
      <Link href="/" className="mt-4 inline-block text-brand-600">
        Torna alla home
      </Link>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <Suspense fallback={<p className="py-20 text-center">Caricamento...</p>}>
        <PaymentResultContent />
      </Suspense>
    </div>
  );
}
