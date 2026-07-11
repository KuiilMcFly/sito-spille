"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import type { Enums } from "@/types/database";
import toast from "react-hot-toast";

const STATUS_FLOW: Enums<"order_status">[] = [
  "paid",
  "accepted",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

type OrderActionsProps = {
  orderId: string;
  currentStatus: Enums<"order_status">;
  adminNotes: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
};

export function OrderActions({
  orderId,
  currentStatus,
  adminNotes,
  trackingNumber,
  trackingUrl,
}: OrderActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(adminNotes || "");
  const [trackingNum, setTrackingNum] = useState(trackingNumber || "");
  const [trackingLink, setTrackingLink] = useState(trackingUrl || "");
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    const response = await fetch("/api/admin/orders/" + orderId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        admin_notes: notes,
        tracking_number: trackingNum || null,
        tracking_url: trackingLink || null,
        notify_customer: true,
      }),
    });

    if (!response.ok) {
      toast.error("Errore aggiornamento");
    } else {
      toast.success("Ordine aggiornato");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4 rounded-xl border border-ink-700 bg-ink-800 p-6">
      <h3 className="font-semibold text-white">Gestione ordine</h3>
      <div>
        <label className="mb-1.5 block text-sm text-ink-400">Stato</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Enums<"order_status">)}
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
        >
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      {(status === "shipped" || trackingNum || trackingLink) && (
        <>
          <Input
            label="Numero tracking"
            value={trackingNum}
            onChange={(e) => setTrackingNum(e.target.value)}
          />
          <Input
            label="URL tracking"
            value={trackingLink}
            onChange={(e) => setTrackingLink(e.target.value)}
          />
        </>
      )}
      <Textarea
        label="Note admin"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <p className="text-xs text-ink-500">
        Al cambio stato il cliente riceve un email di aggiornamento (se Resend e configurato).
      </p>
      <Button onClick={handleUpdate} disabled={loading}>
        {loading ? "Salvataggio..." : "Aggiorna ordine"}
      </Button>
    </div>
  );
}
