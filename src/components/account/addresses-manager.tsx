"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/types/database";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  label: "Casa",
  fullName: "",
  phone: "",
  streetLine1: "",
  streetLine2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "IT",
  isDefault: false,
};

export function AddressesManager() {
  const [addresses, setAddresses] = useState<Tables<"customer_addresses">[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadAddresses() {
    setLoading(true);
    try {
      const response = await fetch("/api/account/addresses");
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setAddresses(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore");
      toast.success("Indirizzo salvato");
      setForm(EMPTY_FORM);
      await loadAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore");
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: string) {
    const response = await fetch("/api/account/addresses/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (response.ok) {
      toast.success("Indirizzo predefinito aggiornato");
      await loadAddresses();
    }
  }

  async function removeAddress(id: string) {
    if (!window.confirm("Eliminare questo indirizzo?")) return;
    const response = await fetch("/api/account/addresses/" + id, { method: "DELETE" });
    if (response.ok) {
      toast.success("Indirizzo eliminato");
      await loadAddresses();
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-lg font-bold text-ink-900">I tuoi indirizzi</h2>
        {loading ? (
          <p className="mt-4 text-sm text-ink-500">Caricamento...</p>
        ) : addresses.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">Nessun indirizzo salvato.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-xl border border-brand-100 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">
                      {address.label}
                      {address.is_default && (
                        <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                          Predefinito
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-ink-600">{address.street_line1}</p>
                    {address.street_line2 && (
                      <p className="text-sm text-ink-600">{address.street_line2}</p>
                    )}
                    <p className="text-sm text-ink-600">
                      {address.postal_code} {address.city} ({address.province})
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!address.is_default && (
                      <button
                        type="button"
                        onClick={() => setDefault(address.id)}
                        className="text-xs font-semibold text-brand-600"
                      >
                        Predefinito
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAddress(address.id)}
                      className="text-xs font-semibold text-red-600"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="text-lg font-bold text-ink-900">Aggiungi indirizzo</h2>
        <Input label="Etichetta" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <Input label="Nome completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Telefono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="Indirizzo *" required value={form.streetLine1} onChange={(e) => setForm({ ...form, streetLine1: e.target.value })} />
        <Input label="Interno / scala" value={form.streetLine2} onChange={(e) => setForm({ ...form, streetLine2: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Citta *" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Provincia *" required value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="CAP *" required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          <Input label="Paese" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          Imposta come predefinito
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvataggio..." : "Salva indirizzo"}
        </Button>
      </form>
    </div>
  );
}
