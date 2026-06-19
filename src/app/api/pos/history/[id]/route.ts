// =============================================================
// API POS History Detail — /api/pos/history/[id]/route.ts
// GET: Ambil detail order + order items berdasarkan ID
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        cashier: { select: { name: true } },
        orderItems: {
          include: {
            product: {
              select: { name: true, price: true, image: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        txId: order.id.slice(-8).toUpperCase(),
        status: order.status,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
        cashierName: order.cashier?.name ?? "-",
        items: order.orderItems.map((item) => ({
          id: item.id,
          productName: item.product?.name ?? "Produk dihapus",
          productImage: item.product?.image ?? null,
          quantity: item.quantity,
          subTotal: item.subTotal,
          unitPrice: item.product?.price ?? 0,
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/pos/history/[id]]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
