import { notFound } from "next/navigation";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { SizeForm } from "@/components/admin/forms";

type Props = { params: Promise<{ id: string }> };

export default async function EditSizePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;
  const { data: size } = await supabase.from("pin_sizes").select("*").eq("id", id).single();

  if (!size) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Modifica taglia</h1>
      <div className="mt-6">
        <SizeForm size={size} />
      </div>
    </div>
  );
}
