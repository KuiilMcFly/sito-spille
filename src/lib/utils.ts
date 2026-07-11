import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
  }).format(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getStorageUrl(path: string, bucket = "product-images") {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return base + "/storage/v1/object/public/" + bucket + "/" + path;
}

export function getSiteAssetUrl(path: string) {
  return getStorageUrl(path, "site-assets");
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "In attesa pagamento",
  paid: "Pagato",
  accepted: "Accettato",
  in_production: "In produzione",
  shipped: "Spedito",
  delivered: "Consegnato",
  cancelled: "Annullato",
  refunded: "Rimborsato",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  created: "Creato",
  approved: "Approvato",
  captured: "Catturato",
  failed: "Fallito",
  refunded: "Rimborsato",
  partially_refunded: "Parz. rimborsato",
};
