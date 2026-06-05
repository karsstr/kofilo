// =============================================================
// API Orders — /api/orders/route.ts
// GET: Riwayat order | POST: Buat order baru
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// ─── GET: Riwayat order ───────────────────────────────────────
export async function GET(req: NextRequest) {
  // TODO: Add Auth check here
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const skip = (page - 1) * limit;

    // Kasir hanya lihat order-nya sendiri; Super Admin lihat semua
    const where = session.role === "CASHIER" ? { cashierId: session.id } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          cashier: { select: { name: true } },
          orderItems: {
            include: { product: { select: { name: true, price: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// ─── POST: Buat order baru ────────────────────────────────────
export async function POST(req: NextRequest) {
  // TODO: Add Auth check here
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, totalAmount, paymentMethod } = body;

    // Validasi input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart tidak boleh kosong" }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ message: "Total amount tidak valid" }, { status: 400 });
    }

    // Validasi semua produk tersedia & hitung ulang total (server-side verification)
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { message: "Beberapa produk tidak tersedia atau tidak ditemukan" },
        { status: 400 }
      );
    }

    // Hitung ulang total server-side untuk keamanan
    const productMap = new Map(products.map((p) => [p.id, p]));
    const calculatedTotal = items.reduce(
      (sum: number, item: { productId: string; quantity: number }) => {
        const product = productMap.get(item.productId);
        return sum + (product?.price ?? 0) * item.quantity;
      },
      0
    );

    // Buat order beserta semua order items dalam satu transaksi
    const order = await prisma.order.create({
      data: {
        totalAmount: calculatedTotal,
        paymentMethod: paymentMethod ?? "CASH",
        status: "COMPLETED",
        cashierId: session.id,
        orderItems: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            subTotal: (productMap.get(item.productId)?.price ?? 0) * item.quantity,
          })),
        },
      },
      include: {
        orderItems: { include: { product: { select: { name: true } } } },
        cashier: { select: { name: true } },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
