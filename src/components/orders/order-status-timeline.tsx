"use client";

import { ORDER_STATUS_LABELS } from "@/lib/utils";
import type { Enums } from "@/types/database";

const FLOW: Enums<"order_status">[] = [
  "paid",
  "accepted",
  "in_production",
  "shipped",
  "delivered",
];

type OrderStatusTimelineProps = {
  currentStatus: Enums<"order_status">;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
};

export function OrderStatusTimeline({
  currentStatus,
  trackingNumber,
  trackingUrl,
}: OrderStatusTimelineProps) {
  if (currentStatus === "cancelled" || currentStatus === "refunded") {
    return (
      <p className="text-sm text-ink-600">
        Stato: {ORDER_STATUS_LABELS[currentStatus]}
      </p>
    );
  }

  const currentIndex = FLOW.indexOf(currentStatus);

  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {FLOW.map((status, index) => {
          const done = currentIndex >= index && currentIndex >= 0;
          const active = currentStatus === status;
          return (
            <li key={status} className="flex items-start gap-3">
              <span
                className={
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                  (done
                    ? "bg-brand-500 text-white"
                    : "border border-brand-200 bg-white text-ink-400")
                }
              >
                {index + 1}
              </span>
              <div>
                <p
                  className={
                    "text-sm font-medium " +
                    (active || done ? "text-ink-900" : "text-ink-400")
                  }
                >
                  {ORDER_STATUS_LABELS[status]}
                </p>
                {status === "shipped" && active && trackingNumber && (
                  <p className="mt-1 text-xs text-ink-500">
                    Tracking: {trackingNumber}
                    {trackingUrl && (
                      <>
                        {" "}
                        —{" "}
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 underline"
                        >
                          Segui spedizione
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
