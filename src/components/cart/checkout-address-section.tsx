"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/types/database";
import type { ShippingAddressPayload } from "@/lib/addresses/types";

export const EMPTY_SHIPPING_ADDRESS: ShippingAddressPayload = {
  label: "Casa",
  streetLine1: "",
  streetLine2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "IT",
};

type CheckoutAddressSectionProps = {
  loggedIn: boolean;
  initialAddresses?: Tables<"customer_addresses">[];
  shippingAddress: ShippingAddressPayload;
  setShippingAddress: (address: ShippingAddressPayload) => void;
  selectedAddressId: string | "new";
  setSelectedAddressId: (id: string | "new") => void;
  saveAddress: boolean;
  setSaveAddress: (value: boolean) => void;
};

function rowToPayload(row: Tables<"customer_addresses">): ShippingAddressPayload {
  return {
    label: row.label,
    fullName: row.full_name || undefined,
    phone: row.phone || undefined,
    streetLine1: row.street_line1,
    streetLine2: row.street_line2 || undefined,
    city: row.city,
    province: row.province,
    postalCode: row.postal_code,
    country: row.country,
  };
}

export function CheckoutAddressSection({
  loggedIn,
  initialAddresses = [],
  shippingAddress,
  setShippingAddress,
  selectedAddressId,
  setSelectedAddressId,
  saveAddress,
  setSaveAddress,
}: CheckoutAddressSectionProps) {
  const [addresses, setAddresses] = useState(initialAddresses);

  useEffect(() => {
    if (!loggedIn || initialAddresses.length > 0) return;
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAddresses(data);
          const def = data.find((a: Tables<"customer_addresses">) => a.is_default) || data[0];
          if (def) {
            setSelectedAddressId(def.id);
            setShippingAddress(rowToPayload(def));
          }
        }
      })
      .catch(() => {});
  }, [loggedIn, initialAddresses.length, setSelectedAddressId, setShippingAddress]);

  function updateField(field: keyof ShippingAddressPayload, value: string) {
    setShippingAddress({ ...shippingAddress, [field]: value });
  }

  function selectSavedAddress(row: Tables<"customer_addresses">) {
    setSelectedAddressId(row.id);
    setShippingAddress(rowToPayload(row));
    setSaveAddress(false);
  }

  return (
    <div className="space-y-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-ink-900">Indirizzo di spedizione</h3>
        {loggedIn && (
          <a href="/account/indirizzi" className="text-xs font-semibold text-brand-600 underline">
            Gestisci indirizzi
          </a>
        )}
      </div>

      {loggedIn && addresses.length > 0 && (
        <div className="grid gap-2">
          {addresses.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => selectSavedAddress(row)}
              className={
                "rounded-xl border px-4 py-3 text-left text-sm " +
                (selectedAddressId === row.id ? "border-brand-500 bg-white" : "border-ink-200 bg-white/70")
              }
            >
              <span className="font-semibold">{row.label}</span>
              <p className="mt-1 text-ink-600">
                {row.street_line1}, {row.postal_code} {row.city}
              </p>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setSelectedAddressId("new");
              setShippingAddress(EMPTY_SHIPPING_ADDRESS);
            }}
            className={
              "rounded-xl border px-4 py-3 text-left text-sm font-semibold " +
              (selectedAddressId === "new" ? "border-brand-500 bg-white" : "border-ink-200")
            }
          >
            Nuovo indirizzo
          </button>
        </div>
      )}

      {(!loggedIn || selectedAddressId === "new" || addresses.length === 0) && (
        <div className="space-y-4">
          {loggedIn && (
            <Input
              label="Etichetta"
              value={shippingAddress.label || ""}
              onChange={(e) => updateField("label", e.target.value)}
            />
          )}
          <Input
            label="Indirizzo *"
            required
            value={shippingAddress.streetLine1}
            onChange={(e) => updateField("streetLine1", e.target.value)}
          />
          <Input
            label="Interno / scala"
            value={shippingAddress.streetLine2 || ""}
            onChange={(e) => updateField("streetLine2", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Citta *"
              required
              value={shippingAddress.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
            <Input
              label="Provincia *"
              required
              value={shippingAddress.province}
              onChange={(e) => updateField("province", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="CAP *"
              required
              value={shippingAddress.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
            />
            <Input
              label="Paese"
              value={shippingAddress.country}
              onChange={(e) => updateField("country", e.target.value)}
            />
          </div>
          {loggedIn && selectedAddressId === "new" && (
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
              />
              Salva indirizzo per i prossimi ordini
            </label>
          )}
        </div>
      )}
    </div>
  );
}

export function validateShippingAddress(address: ShippingAddressPayload): boolean {
  return Boolean(
    address.streetLine1.trim() &&
      address.city.trim() &&
      address.province.trim() &&
      address.postalCode.trim()
  );
}
