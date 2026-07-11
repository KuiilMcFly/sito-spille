"use client";

import Link from "next/link";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import { Badge, getOrderStatusVariant } from "@/components/ui/badge";
import type { ProductionItem } from "@/lib/production/load-production-items";
import { Printer } from "lucide-react";

type ProductionBoardProps = {
  items: ProductionItem[];
};

export function ProductionBoard({ items }: ProductionBoardProps) {
  const grouped = new Map<string, ProductionItem[]>();
  for (const item of items) {
    const list = grouped.get(item.orderId) || [];
    list.push(item);
    grouped.set(item.orderId, list);
  }

  function handlePrint() {
    window.print();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-ink-700 bg-ink-800 p-8 text-center text-ink-400">
        Nessun ordine in coda produzione. Gli ordini accettati o in produzione compariranno qui.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-ink-400">{items.length} righe in coda</p>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
        >
          <Printer className="h-4 w-4" />
          Stampa scheda produzione
        </button>
      </div>

      <div className="production-print space-y-8">
        {Array.from(grouped.entries()).map(([orderId, orderItems]) => {
          const first = orderItems[0];
          return (
            <article
              key={orderId}
              className="break-inside-avoid rounded-xl border border-ink-700 bg-ink-800 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-700 pb-4">
                <div>
                  <Link
                    href={"/admin/ordini/" + orderId}
                    className="text-xl font-bold text-white hover:text-brand-300 print:no-underline print:text-black"
                  >
                    {first.orderNumber}
                  </Link>
                  <p className="mt-1 text-sm text-ink-400 print:text-gray-600">
                    {first.customerName || first.customerEmail}
                  </p>
                  <p className="text-xs text-ink-500 print:text-gray-500">
                    {new Date(first.createdAt).toLocaleString("it-IT")}
                  </p>
                </div>
                <Badge variant={getOrderStatusVariant(first.orderStatus)}>
                  {ORDER_STATUS_LABELS[first.orderStatus]}
                </Badge>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {orderItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="rounded-xl border border-ink-700 bg-ink-900/50 p-4 print:border-gray-300 print:bg-white"
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        {item.designUrl ? (
                          <img
                            src={item.designUrl}
                            alt="Design"
                            className="h-28 w-28 rounded-full object-cover pin-shadow print:h-32 print:w-32"
                          />
                        ) : (
                          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-ink-700 text-xs text-ink-400 print:border print:border-gray-300">
                            Catalogo
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-semibold text-white print:text-black">
                          {item.isCustom ? "Spilla custom" : item.productName}
                        </p>
                        <p className="mt-2 text-ink-300 print:text-gray-700">
                          Taglia: {item.pinSizeName} ({item.pinDiameterMm} mm)
                        </p>
                        <p className="text-ink-300 print:text-gray-700">Quantita: {item.quantity}</p>
                        <p className="text-ink-300 print:text-gray-700">Effetto: {item.effectLabel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
