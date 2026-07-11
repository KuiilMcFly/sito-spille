import toast from "react-hot-toast";
import { ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-messages";

export async function ensureOrdersOpen(): Promise<boolean> {
  const response = await fetch("/api/orders/status");
  const data = await response.json();

  if (!data.open) {
    toast.error(data.message || ORDERS_CLOSED_MESSAGE);
    return false;
  }

  return true;
}
