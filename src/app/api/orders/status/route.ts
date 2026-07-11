import { NextResponse } from "next/server";
import { areOrdersOpen, ORDERS_CLOSED_MESSAGE } from "@/lib/orders/orders-open";

export async function GET() {
  const open = await areOrdersOpen();
  return NextResponse.json({
    open,
    message: ORDERS_CLOSED_MESSAGE,
  });
}
