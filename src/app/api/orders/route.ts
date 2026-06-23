// =============================================================
// API Orders — /api/orders/route.ts
// GET: Riwayat order | POST: Buat order baru
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Hitung poin berdasarkan aturan yang diminta:
 * "Dari Nominal yang customer bayar, kalau belakangnya 0-5 maka di
 *  bulatkan ke bawah, 6-9 di bulatkan ke atas"
 *
 * Contoh rewardPerAmount=10000:
 *   54.000 → 5 poin (digit 4, 0-5 → bawah)
 *   56.000 → 6 poin (digit 6, 6-9 → atas)
 *   62.000 → 6 poin (digit 2, 0-5 → bawah)
 *   60.000 → 6 poin (digit 0, 0-5 → bawah)
 *   55.000 → 5 poin (digit 5, 0-5 → bawah)
 *   59.000 → 6 poin (digit 9, 6-9 → atas)
 */
function calculatePoints(totalAmount: number, perAmount: number, earned: number): number {
  if (perAmount <= 0) return 0;
  const base = Math.floor(totalAmount / perAmount);
  const remainder = totalAmount % perAmount;
  // Threshold: jika remainder >= 60% dari perAmount → dibulatkan ke atas
  const threshold = Math.ceil(perAmount * 0.6);
  const extra = remainder >= threshold ? 1 : 0;
  return (base + extra) * earned;
}

// ─── GET: Riwayat order ───────────────────────────────────────
export async function GET(req: NextRequest) {
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
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, totalAmount, paymentMethod, customerPhone } = body;

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

    // Ambil settings poin dari database
    const settings = await prisma.storeSetting.findFirst();
    const rewardPerAmount = settings?.rewardPerAmount ?? 10000;
    const pointsEarned = settings?.pointsEarned ?? 1;

    // Tangkap waktu saat ini untuk disimpan sebagai "Last Transaction"
    const now = new Date();

    // Buat order beserta semua order items dan update poin customer dalam satu transaksi
    const order = await prisma.$transaction(async (tx) => {
      if (customerPhone && typeof customerPhone === "string") {
        // 1. Bersihkan dari karakter aneh
        let cleanPhone = customerPhone.replace(/\D/g, "");
        
        // 2. FORMAT PREFIX OTOMATIS: Pastikan selalu diawali "62"
        if (cleanPhone.startsWith("0")) {
          cleanPhone = "62" + cleanPhone.slice(1);
        } else if (cleanPhone.startsWith("8")) {
          cleanPhone = "62" + cleanPhone;
        }

        if (cleanPhone.length >= 10 && cleanPhone.length <= 14) {
          // Hitung poin dengan aturan pembulatan baru
          const earnedPoints = calculatePoints(calculatedTotal, rewardPerAmount, pointsEarned);

          const existingCustomer = await tx.customer.findUnique({
            where: { phone: cleanPhone },
          });

          if (existingCustomer) {
            // UPDATE poin customer yang sudah ada
            await tx.customer.update({
              where: { id: existingCustomer.id },
              data: { 
                points: existingCustomer.points + earnedPoints,
                updatedAt: now,
              },
            });
          } else {
            // BUAT customer baru
            await tx.customer.create({
              data: {
                phone: cleanPhone,
                name: "-", // Nama default, bisa di-update nanti via PWA login
                points: earnedPoints,
                createdAt: now,
                updatedAt: now,
              },
            });
          }
        }
      }

      return await tx.order.create({
        data: {
          totalAmount: calculatedTotal,
          paymentMethod: paymentMethod ?? "CASH",
          status: "COMPLETED",
          cashierId: session.id,
          createdAt: now,
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
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}