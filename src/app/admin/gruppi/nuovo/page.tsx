import { GroupForm } from "@/components/admin/group-form";

export default function NewGroupPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Nuovo gruppo</h1>
      <div className="mt-6">
        <GroupForm />
      </div>
    </div>
  );
}
