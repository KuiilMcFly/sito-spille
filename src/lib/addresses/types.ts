export type ShippingAddressPayload = {
  label?: string;
  fullName?: string;
  phone?: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

export function formatShippingAddressLine(address: ShippingAddressPayload): string {
  const parts = [
    address.streetLine1,
    address.streetLine2,
    address.postalCode + " " + address.city,
    address.province,
    address.country,
  ].filter(Boolean);
  return parts.join(", ");
}

export function shippingAddressFromRow(row: {
  label: string;
  full_name: string | null;
  phone: string | null;
  street_line1: string;
  street_line2: string | null;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}): ShippingAddressPayload {
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

export function shippingAddressToJson(address: ShippingAddressPayload) {
  return {
    label: address.label || "Spedizione",
    full_name: address.fullName || null,
    phone: address.phone || null,
    street_line1: address.streetLine1,
    street_line2: address.streetLine2 || null,
    city: address.city,
    province: address.province,
    postal_code: address.postalCode,
    country: address.country || "IT",
  };
}
