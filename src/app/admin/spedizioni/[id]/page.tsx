import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ShippingForm } from "@/components/admin/shipping-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditShippingPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: method } = await supabase.from("shipping_methods").select("*").eq("id", id).single();
  if (!method) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Modifica spedizione</h1>
      <div className="mt-6">
        <ShippingForm method={method} />
      </div>
    </div>
  );
}
