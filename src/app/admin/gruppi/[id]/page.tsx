import { notFound } from "next/navigation";
import { createAdminClientIfConfigured } from "@/lib/supabase/admin";
import { GroupForm } from "@/components/admin/group-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditGroupPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClientIfConfigured();
  if (!supabase) return null;

  const { data: group } = await supabase
    .from("product_groups")
    .select("*")
    .eq("id", id)
    .single();

  if (!group) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Modifica gruppo</h1>
      <div className="mt-6">
        <GroupForm group={group} />
      </div>
    </div>
  );
}
