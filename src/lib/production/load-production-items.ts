import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { getFinishEffectLabel } from "@/lib/customizer/finish-effects";
import type { CustomizationData, Tables } from "@/types/database";

export type ProductionItem = {
  orderId: string;
  orderNumber: string;
  orderStatus: Tables<"orders">["status"];
  customerName: string | null;
  customerEmail: string;
  itemId: string;
  quantity: number;
  pinSizeName: string;
  pinDiameterMm: number;
  effectLabel: string;
  designUrl: string | null;
  isCustom: boolean;
  productName: string | null;
  createdAt: string;
};

export async function loadProductionItems(): Promise<ProductionItem[]> {
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, customer_name, customer_email, created_at")
    .in("status", ["accepted", "in_production"])
    .order("created_at", { ascending: true });

  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("*, pin_sizes(*), products(name)")
    .in("order_id", orderIds);

  if (!items) return [];

  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const productionItems: ProductionItem[] = [];

  for (const item of items) {
    const order = orderMap.get(item.order_id);
    if (!order) continue;

    let designUrl: string | null = null;
    if (item.is_custom && item.custom_design_path) {
      const { data: signed } = await supabase.storage
        .from("custom-designs")
        .createSignedUrl(item.custom_design_path, 3600);
      designUrl = signed?.signedUrl || null;
    }

    const customData = item.customization_data as CustomizationData | null;
    const pinSize = item.pin_sizes as { name: string; diameter_mm: number } | null;
    const product = item.products as { name: string } | null;

    productionItems.push({
      orderId: order.id,
      orderNumber: order.order_number,
      orderStatus: order.status,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      itemId: item.id,
      quantity: item.quantity,
      pinSizeName: pinSize?.name || "—",
      pinDiameterMm: pinSize?.diameter_mm || 0,
      effectLabel: item.is_custom ? getFinishEffectLabel(customData?.finishEffect) : "Catalogo",
      designUrl,
      isCustom: item.is_custom,
      productName: product?.name || null,
      createdAt: order.created_at,
    });
  }

  return productionItems;
}
