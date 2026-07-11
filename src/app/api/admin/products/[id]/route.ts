import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("admin_profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin";
}

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const supabase = createAdminClient();

  const stockRaw = formData.get("stockQuantity") as string;
  const groupId = (formData.get("productGroupId") as string) || null;
  const typologyId = (formData.get("productTypologyId") as string) || null;

  const { error } = await supabase
    .from("products")
    .update({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: (formData.get("description") as string) || null,
      author: (formData.get("author") as string) || null,
      price: parseFloat(formData.get("price") as string),
      pin_size_id: formData.get("pinSizeId") as string,
      product_group_id: groupId || null,
      product_typology_id: typologyId || null,
      stock_quantity: stockRaw ? parseInt(stockRaw) : null,
      is_featured: formData.get("isFeatured") === "true",
      is_active: formData.get("isActive") === "true",
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const image = formData.get("image") as File | null;
  if (image && image.size > 0) {
    const path = id + "/" + uuidv4() + ".webp";
    const buffer = Buffer.from(await image.arrayBuffer());
    await supabase.storage.from("product-images").upload(path, buffer, {
      contentType: image.type,
    });
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", id);
    await supabase.from("product_images").insert({
      product_id: id,
      storage_path: path,
      alt_text: formData.get("name") as string,
      is_primary: true,
      sort_order: 0,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
