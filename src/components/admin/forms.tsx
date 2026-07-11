"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { DeleteResourceButton } from "@/components/admin/delete-resource-button";
import { slugify, getStorageUrl } from "@/lib/utils";
import type { Tables } from "@/types/database";
import toast from "react-hot-toast";

type SizeFormProps = {
  size?: Tables<"pin_sizes">;
};

export function SizeForm({ size }: SizeFormProps) {
  const router = useRouter();
  const [name, setName] = useState(size?.name || "");
  const [diameter, setDiameter] = useState(String(size?.diameter_mm || ""));
  const [basePrice, setBasePrice] = useState(String(size?.base_price || ""));
  const [customPrice, setCustomPrice] = useState(String(size?.custom_price ?? size?.base_price ?? ""));
  const [description, setDescription] = useState(size?.description || "");
  const [sortOrder, setSortOrder] = useState(String(size?.sort_order || 0));
  const [isActive, setIsActive] = useState(size?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(size?.is_featured ?? false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      diameter_mm: parseFloat(diameter),
      base_price: parseFloat(basePrice),
      custom_price: parseFloat(customPrice),
      description: description || null,
      sort_order: parseInt(sortOrder) || 0,
      is_active: isActive,
      is_featured: isFeatured,
    };

    const url = size ? "/api/admin/sizes/" + size.id : "/api/admin/sizes";
    const method = size ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Errore salvataggio");
      setLoading(false);
      return;
    }

    toast.success(size ? "Taglia aggiornata" : "Taglia creata");
    router.push("/admin/taglie");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Diametro (mm)" type="number" step="0.1" required value={diameter} onChange={(e) => setDiameter(e.target.value)} />
      <Input label="Prezzo catalogo (EUR)" type="number" step="0.01" required value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
      <Input label="Prezzo personalizzazione (EUR)" type="number" step="0.01" required value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
      <Textarea label="Descrizione" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Ordine" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Attiva
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        In evidenza in home
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva"}
        </Button>
        {size && (
          <DeleteResourceButton
            apiUrl={"/api/admin/sizes/" + size.id}
            redirectTo="/admin/taglie"
            resourceLabel={"la taglia \"" + size.name + "\""}
          />
        )}
      </div>
    </form>
  );
}

type ProductFormProps = {
  product?: Tables<"products">;
  sizes: Tables<"pin_sizes">[];
  groups?: Tables<"product_groups">[];
  typologies?: Tables<"product_typologies">[];
  primaryImageUrl?: string | null;
};

export function ProductForm({
  product,
  sizes,
  groups = [],
  typologies = [],
  primaryImageUrl,
}: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [author, setAuthor] = useState(product?.author || "");
  const [price, setPrice] = useState(String(product?.price || ""));
  const [pinSizeId, setPinSizeId] = useState(product?.pin_size_id || sizes[0]?.id || "");
  const [groupId, setGroupId] = useState(product?.product_group_id || "");
  const [typologyId, setTypologyId] = useState(product?.product_typology_id || "");
  const [stock, setStock] = useState(product?.stock_quantity != null ? String(product.stock_quantity) : "");
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!product) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("author", author);
    formData.append("price", price);
    formData.append("pinSizeId", pinSizeId);
    formData.append("productGroupId", groupId);
    formData.append("productTypologyId", typologyId);
    formData.append("stockQuantity", stock);
    formData.append("isFeatured", String(isFeatured));
    formData.append("isActive", String(isActive));
    if (image) formData.append("image", image);

    const url = product ? "/api/admin/products/" + product.id : "/api/admin/products";
    const method = product ? "PUT" : "POST";

    const response = await fetch(url, { method, body: formData });

    if (!response.ok) {
      toast.error("Errore salvataggio");
      setLoading(false);
      return;
    }

    toast.success(product ? "Prodotto aggiornato" : "Prodotto creato");
    router.push("/admin/prodotti");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Input label="Nome" required value={name} onChange={(e) => handleNameChange(e.target.value)} />
      <Input label="Slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
      <Input label="Autore artwork" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <Textarea label="Descrizione" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Prezzo (EUR)" type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-200">Taglia</label>
        <select
          value={pinSizeId}
          onChange={(e) => setPinSizeId(e.target.value)}
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
        >
          {sizes.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-200">Gruppo</label>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
        >
          <option value="">Nessun gruppo</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-200">Tipologia</label>
        <select
          value={typologyId}
          onChange={(e) => setTypologyId(e.target.value)}
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-white"
        >
          <option value="">Nessuna tipologia</option>
          {typologies.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <Input label="Stock (vuoto = illimitato)" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
      <ImageUploadField
        label="Foto prodotto"
        required={!product}
        aspectRatio="square"
        currentUrl={primaryImageUrl}
        onChange={(file) => setImage(file)}
      />
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        In evidenza in home
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Attivo
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva"}
        </Button>
        {product && (
          <DeleteResourceButton
            apiUrl={"/api/admin/products/" + product.id}
            redirectTo="/admin/prodotti"
            resourceLabel={"il prodotto \"" + product.name + "\""}
          />
        )}
      </div>
    </form>
  );
}
