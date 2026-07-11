"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeleteResourceButton } from "@/components/admin/delete-resource-button";
import type { Tables } from "@/types/database";
import toast from "react-hot-toast";

type ShippingFormProps = {
  method?: Tables<"shipping_methods">;
};

export function ShippingForm({ method }: ShippingFormProps) {
  const router = useRouter();
  const [name, setName] = useState(method?.name || "");
  const [description, setDescription] = useState(method?.description || "");
  const [price, setPrice] = useState(String(method?.price || ""));
  const [carrier, setCarrier] = useState(method?.carrier || "poste_italiane");
  const [deliveryType, setDeliveryType] = useState(method?.delivery_type || "pickup_point");
  const [estimatedDays, setEstimatedDays] = useState(method?.estimated_days || "");
  const [sortOrder, setSortOrder] = useState(String(method?.sort_order || 0));
  const [isActive, setIsActive] = useState(method?.is_active ?? true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      description: description || null,
      price: parseFloat(price),
      carrier,
      delivery_type: deliveryType,
      estimated_days: estimatedDays || null,
      sort_order: parseInt(sortOrder) || 0,
      is_active: isActive,
    };

    const url = method ? "/api/admin/shipping/" + method.id : "/api/admin/shipping";
    const response = await fetch(url, {
      method: method ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Errore salvataggio");
    } else {
      toast.success(method ? "Spedizione aggiornata" : "Spedizione creata");
      router.push("/admin/spedizioni");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea label="Descrizione" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Prezzo (EUR)" type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-200">Tipo consegna</label>
        <select
          value={deliveryType}
          onChange={(e) => setDeliveryType(e.target.value)}
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
        >
          <option value="pickup_point">Punto ritiro (Poste/Locker)</option>
          <option value="home">Consegna a domicilio</option>
        </select>
      </div>
      <Input label="Giorni stimati" value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} />
      <Input label="Ordine" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Attiva
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva"}
        </Button>
        {method && (
          <DeleteResourceButton
            apiUrl={"/api/admin/shipping/" + method.id}
            redirectTo="/admin/spedizioni"
            resourceLabel={"il metodo di spedizione \"" + method.name + "\""}
          />
        )}
      </div>
    </form>
  );
}
