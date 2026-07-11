"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, CartItemCatalog, CartItemCustom } from "@/lib/cart/types";

const STORAGE_KEY = "valeria_cart";

function createCartItemId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2);
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addCustomItem: (item: Omit<CartItemCustom, "id">) => boolean;
  addCatalogItem: (item: Omit<CartItemCatalog, "id">) => boolean;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveItems(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveItems(items);
  }, [items, hydrated]);

  const addCustomItem = useCallback((item: Omit<CartItemCustom, "id">) => {
    let saved = true;
    setItems((prev) => {
      const next = [...prev, { ...item, id: createCartItemId() }];
      saved = saveItems(next);
      return next;
    });
    return saved;
  }, []);

  const addCatalogItem = useCallback((item: Omit<CartItemCatalog, "id">) => {
    let saved = true;
    setItems((prev) => {
      let next: CartItem[];
      const existing = prev.find(
        (i) => i.type === "catalog" && i.productId === item.productId
      );
      if (existing && existing.type === "catalog") {
        next = prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        next = [...prev, { ...item, id: createCartItemId() }];
      }
      saved = saveItems(next);
      return next;
    });
    return saved;
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addCustomItem,
      addCatalogItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, count, subtotal, addCustomItem, addCatalogItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
