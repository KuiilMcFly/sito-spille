import { ShippingForm } from "@/components/admin/shipping-form";

export default function NewShippingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Nuovo metodo di spedizione</h1>
      <div className="mt-6">
        <ShippingForm />
      </div>
    </div>
  );
}
