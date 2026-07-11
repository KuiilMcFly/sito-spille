"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { DeleteResourceButton } from "@/components/admin/delete-resource-button";
import { slugify, getSiteAssetUrl } from "@/lib/utils";
import type { Tables } from "@/types/database";
import toast from "react-hot-toast";

type GroupFormProps = {
  group?: Tables<"product_groups">;
};

export function GroupForm({ group }: GroupFormProps) {
  const router = useRouter();
  const [name, setName] = useState(group?.name || "");
  const [slug, setSlug] = useState(group?.slug || "");
  const [description, setDescription] = useState(group?.description || "");
  const [sortOrder, setSortOrder] = useState(String(group?.sort_order || 0));
  const [isActive, setIsActive] = useState(group?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(group?.is_featured ?? false);
  const [cover, setCover] = useState<File | null>(null);
  const [background, setBackground] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!group) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("sortOrder", sortOrder);
    formData.append("isActive", String(isActive));
    formData.append("isFeatured", String(isFeatured));
    if (cover) formData.append("cover", cover);
    if (background) formData.append("background", background);

    const url = group ? "/api/admin/groups/" + group.id : "/api/admin/groups";
    const method = group ? "PUT" : "POST";

    const response = await fetch(url, { method, body: formData });

    if (!response.ok) {
      toast.error("Errore salvataggio");
      setLoading(false);
      return;
    }

    toast.success(group ? "Gruppo aggiornato" : "Gruppo creato");
    router.push("/admin/gruppi");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Input label="Nome" required value={name} onChange={(e) => handleNameChange(e.target.value)} />
      <Input label="Slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
      <Textarea label="Descrizione" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      <ImageUploadField
        label="Cover del gruppo"
        required={!group}
        aspectRatio="4/3"
        currentUrl={group?.cover_path ? getSiteAssetUrl(group.cover_path) : null}
        onChange={(file) => setCover(file)}
      />
      <ImageUploadField
        label="Background pagina gruppo"
        aspectRatio="16/9"
        currentUrl={group?.background_path ? getSiteAssetUrl(group.background_path) : null}
        onChange={(file) => setBackground(file)}
      />
      <Input label="Ordine" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Attivo
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        In evidenza in home
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva"}
        </Button>
        {group && (
          <DeleteResourceButton
            apiUrl={"/api/admin/groups/" + group.id}
            redirectTo="/admin/gruppi"
            resourceLabel={"il gruppo \"" + group.name + "\""}
          />
        )}
      </div>
    </form>
  );
}
