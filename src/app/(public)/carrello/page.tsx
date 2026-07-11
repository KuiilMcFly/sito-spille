import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata = { title: "Carrello" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-900">Carrello</h1>
      <div className="mt-8">
        <CartPageClient />
      </div>
    </div>
  );
}
