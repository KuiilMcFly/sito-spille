import type { CustomizationData } from "@/types/database";

export type CartItemCustom = {
  id: string;
  type: "custom";
  pinSizeId: string;
  pinSizeName: string;
  quantity: number;
  unitPrice: number;
  designBase64: string;
  customization: CustomizationData;
  label: string;
};

export type CartItemCatalog = {
  id: string;
  type: "catalog";
  productId: string;
  productName: string;
  pinSizeId: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
};

export type CartItem = CartItemCustom | CartItemCatalog;

export type CheckoutItemPayload =
  | {
      type: "custom";
      pinSizeId: string;
      quantity: number;
      designBase64: string;
      customization: CustomizationData;
    }
  | {
      type: "catalog";
      productId: string;
      quantity: number;
    };
