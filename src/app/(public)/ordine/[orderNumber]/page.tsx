import { OrderLookup } from "@/components/orders/order-lookup";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export const metadata = { title: "Traccia ordine" };

export default async function OrderPage({ params }: Props) {
  const { orderNumber } = await params;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-ink-900">
        Stato ordine
      </h1>
      <div className="mt-8">
        <OrderLookup orderNumber={orderNumber} />
      </div>
    </div>
  );
}
