"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ensureOrdersOpen } from "@/lib/orders/orders-open-client";
import { ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-messages";

type PayPalCheckoutProps = {
  disabled?: boolean;
  ordersOpen?: boolean;
  onPrepareOrder: () => Promise<{ orderId: string; orderNumber: string }>;
  onPaid: (orderNumber: string) => void;
};

type PayPalButtonsInstance = {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => void;
};

type PayPalSdk = {
  Buttons: (options: {
    style?: Record<string, string | number>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalSdk;
  }
}

let paypalScriptPromise: Promise<void> | null = null;

function loadPayPalScript(clientId: string): Promise<void> {
  if (window.paypal) {
    return Promise.resolve();
  }

  if (paypalScriptPromise) {
    return paypalScriptPromise;
  }

  paypalScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-paypal-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("PayPal SDK error")));
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=" +
      encodeURIComponent(clientId) +
      "&currency=EUR&intent=capture&components=buttons";
    script.async = true;
    script.dataset.paypalSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossibile caricare PayPal"));
    document.body.appendChild(script);
  });

  return paypalScriptPromise;
}

export function PayPalCheckout({
  disabled,
  ordersOpen = true,
  onPrepareOrder,
  onPaid,
}: PayPalCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<PayPalButtonsInstance | null>(null);
  const handlersRef = useRef({ onPrepareOrder, onPaid });
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  handlersRef.current = { onPrepareOrder, onPaid };

  useEffect(() => {
    if (!clientId || !containerRef.current || !ordersOpen) {
      return;
    }

    let cancelled = false;

    loadPayPalScript(clientId)
      .then(() => {
        if (cancelled || !containerRef.current || !window.paypal) {
          return;
        }

        if (buttonsRef.current?.close) {
          buttonsRef.current.close();
        }

        containerRef.current.innerHTML = "";

        const buttons = window.paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 48,
          },
          createOrder: async () => {
            try {
              if (!(await ensureOrdersOpen())) {
                throw new Error(ORDERS_CLOSED_MESSAGE);
              }

              const { orderId } = await handlersRef.current.onPrepareOrder();
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
              });
              const data = await response.json();
              if (!response.ok) {
                throw new Error(data.error || "Errore creazione pagamento PayPal");
              }
              return data.paypalOrderId as string;
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Errore PayPal imprevisto";
              toast.error(message);
              throw err;
            }
          },
          onApprove: async (data) => {
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paypalOrderId: data.orderID }),
            });
            const result = await response.json();
            if (!response.ok) {
              toast.error(result.error || "Errore conferma pagamento");
              return;
            }
            handlersRef.current.onPaid(result.orderNumber as string);
          },
          onCancel: () => {
            toast("Pagamento annullato.", { icon: "!" });
          },
          onError: () => {
            toast.error("Errore durante il pagamento PayPal. Riprova.");
          },
        });

        buttonsRef.current = buttons;
        return buttons.render(containerRef.current);
      })
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Errore PayPal");
        }
      });

    return () => {
      cancelled = true;
      if (buttonsRef.current?.close) {
        buttonsRef.current.close();
      }
    };
  }, [clientId, ordersOpen]);

  if (!ordersOpen) {
    return null;
  }

  if (!clientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Pagamento PayPal non ancora configurato. Inserisci Client ID e Secret PayPal
        nel file .env.local (account walice345@gmail.com su developer.paypal.com).
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {loadError}
      </div>
    );
  }

  return (
    <div
      className={disabled ? "pointer-events-none opacity-50" : ""}
      aria-disabled={disabled}
    >
      {!ready && (
        <p className="mb-2 text-sm text-ink-500">Caricamento PayPal...</p>
      )}
      <div ref={containerRef} />
    </div>
  );
}
