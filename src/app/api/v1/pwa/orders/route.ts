// =============================================================
// API: POST /api/v1/pwa/orders
// Submit pesanan dari PWA ke backend
// Wajib Bearer token dari customer
// Payload: { tableId, items: [{productId, name, price, quantity, variants?}] }
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractBearerToken, verifyPwaToken } from "@/lib/pwa-jwt";

export async function POST(req: NextRequest) {
  try {
    // --- Autentikasi ---
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: Token tidak ditemukan" },
        { status: 401 }
      );
    }

    let customerPayload;
    try {
      customerPayload = await verifyPwaToken(token);
    } catch {
      return NextResponse.json(
        { message: "Unauthorized: Token tidak valid atau sudah expired" },
        { status: 401 }
      );
    }

    // --- Validasi Body ---
    const body = await req.json();
    const { tableId, items } = body as {
      tableId?: string;
      items?: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
        variants?: string;
      }>;
    };

    if (!tableId || typeof tableId !== "string") {
      return NextResponse.json(
        { message: "tableId wajib diisi" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Keranjang tidak boleh kosong" },
        { status: 400 }
      );
    }

    // --- Hitung Total (server-side, ambil harga dari DB) ---
    const productIds = [...new Set(items.map((i) => i.productId))];
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
      select: { id: true, price: true, name: true },
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { message: "Beberapa produk tidak tersedia atau tidak ditemukan" },
        { status: 400 }
      );
    }

    const productPriceMap = new Map(dbProducts.map((p) => [p.id, p.price]));

    // Hitung total berdasarkan harga DB (keamanan: tolak harga manipulasi client)
    // Catatan: price dari client dipakai sebagai fallback untuk produk dengan add-on (Large cup +5000)
    // Untuk keamanan penuh production, hitung semua di server
    const totalAmount = items.reduce((sum, item) => {
      const dbPrice = productPriceMap.get(item.productId) ?? 0;
      // Izinkan price dari client jika lebih besar (untuk add-on seperti Large cup)
      // tapi batasi maksimum 2x harga DB
      const finalPrice =
        item.price > dbPrice && item.price <= dbPrice * 2
          ? item.price
          : dbPrice;
      return sum + finalPrice * item.quantity;
    }, 0);

    // Snapshot items untuk disimpan di DB (JSON)
    const itemsSnapshot = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      variants: item.variants ?? null,
      subTotal: item.price * item.quantity,
    }));

    // --- Buat PwaOrder ---
    const pwaOrder = await prisma.pwaOrder.create({
      data: {
        tableId,
        customerId: customerPayload.sub,
        totalAmount,
        status: "PENDING_CONFIRMATION",
        items: itemsSnapshot,
      },
    });

    return NextResponse.json(
      {
        message: "Pesanan berhasil dibuat",
        orderId: pwaOrder.id,
        status: pwaOrder.status,
        totalAmount: pwaOrder.totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/v1/pwa/orders]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
