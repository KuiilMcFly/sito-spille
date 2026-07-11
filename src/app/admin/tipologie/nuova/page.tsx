import { TypologyForm } from "@/components/admin/typology-form";

export default function NewTypologyPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Nuova tipologia</h1>
      <div className="mt-6">
        <TypologyForm />
      </div>
    </div>
  );
}
