// =============================================================
// API POS History — /api/pos/history/route.ts
// GET: Ambil semua transaksi Order hari ini (today's transactions)
// =============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Filter: hanya transaksi hari ini
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        cashier: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((order, index) => ({
      id: order.id,
      no: orders.length - index,
      txId: order.id.slice(-8).toUpperCase(),
      time: order.createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      cashierName: order.cashier?.name ?? "-",
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("[GET /api/pos/history]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
