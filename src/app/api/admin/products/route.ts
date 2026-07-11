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

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const author = (formData.get("author") as string) || null;
  const price = parseFloat(formData.get("price") as string);
  const pinSizeId = formData.get("pinSizeId") as string;
  const groupId = (formData.get("productGroupId") as string) || null;
  const typologyId = (formData.get("productTypologyId") as string) || null;
  const stockRaw = formData.get("stockQuantity") as string;
  const isFeatured = formData.get("isFeatured") === "true";
  const isActive = formData.get("isActive") === "true";
  const image = formData.get("image") as File | null;

  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description: description || null,
      author,
      price,
      pin_size_id: pinSizeId,
      product_group_id: groupId || null,
      product_typology_id: typologyId || null,
      stock_quantity: stockRaw ? parseInt(stockRaw) : null,
      is_featured: isFeatured,
      is_active: isActive,
    })
    .select()
    .single();

  if (error || !product) {
    return NextResponse.json({ error: error?.message || "Error" }, { status: 500 });
  }

  if (image && image.size > 0) {
    const path = product.id + "/" + uuidv4() + ".webp";
    const buffer = Buffer.from(await image.arrayBuffer());
    await supabase.storage.from("product-images").upload(path, buffer, {
      contentType: image.type,
    });
    await supabase.from("product_images").insert({
      product_id: product.id,
      storage_path: path,
      alt_text: name,
      is_primary: true,
      sort_order: 0,
    });
  }

  return NextResponse.json(product);
}
