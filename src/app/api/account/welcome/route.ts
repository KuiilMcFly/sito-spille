import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const name = body.name ? String(body.name) : null;

  if (!email) {
    return NextResponse.json({ error: "Email mancante" }, { status: 400 });
  }

  await sendWelcomeEmail({ to: email, name });
  return NextResponse.json({ ok: true });
}
