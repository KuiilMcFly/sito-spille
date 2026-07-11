import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("wishlist_items")
    .select("id, product_id, created_at, products(*, product_images(*), pin_sizes(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Accedi per salvare i preferiti" }, { status: 401 });
  }

  const body = await request.json();
  const productId = String(body.productId || "");
  if (!productId) {
    return NextResponse.json({ error: "Prodotto mancante" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wishlist_items")
    .upsert({ user_id: user.id, product_id: productId }, { onConflict: "user_id,product_id" })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
