import { getSiteSetting } from "@/lib/settings";
import { ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-messages";

export { ORDERS_CLOSED_MESSAGE };

export async function areOrdersOpen(): Promise<boolean> {
  const setting = await getSiteSetting<{ open: boolean }>("orders_open", { open: true });
  return setting.open !== false;
}
