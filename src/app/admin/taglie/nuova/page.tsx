import { SizeForm } from "@/components/admin/forms";

export default function NewSizePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Nuova taglia</h1>
      <div className="mt-6">
        <SizeForm />
      </div>
    </div>
  );
}
