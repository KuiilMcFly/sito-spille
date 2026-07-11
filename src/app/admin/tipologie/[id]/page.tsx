import { notFound } from "next/navigation";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { TypologyForm } from "@/components/admin/typology-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditTypologyPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const { data: typology } = await supabase
    .from("product_typologies")
    .select("*")
    .eq("id", id)
    .single();

  if (!typology) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Modifica tipologia</h1>
      <div className="mt-6">
        <TypologyForm typology={typology} />
      </div>
    </div>
  );
}
