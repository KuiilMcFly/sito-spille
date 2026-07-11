import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";

function buildToken() {
  return randomBytes(16).toString("hex");
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("wishlist_shares")
    .select("share_token")
    .eq("user_id", user.id)
    .single();

  let token = existing?.share_token;
  if (!token) {
    token = buildToken();
    await admin.from("wishlist_shares").upsert({
      user_id: user.id,
      share_token: token,
    });
  }

  const shareUrl = getSiteUrl() + "/condividi/preferiti/" + token;
  return NextResponse.json({ shareUrl, token });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const token = buildToken();
  await admin.from("wishlist_shares").upsert({
    user_id: user.id,
    share_token: token,
  });

  const shareUrl = getSiteUrl() + "/condividi/preferiti/" + token;
  return NextResponse.json({ shareUrl, token });
}
