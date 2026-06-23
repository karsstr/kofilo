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
    const { tableId, items, paymentMethod } = body as {
      tableId?: string;
      paymentMethod?: string;
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

    // --- Loyalty: Hitung & tambah poin jika fitur aktif ---
    // Di-wrap try-catch agar SETIAP APAPUN yang terjadi, loyalty tidak pernah bikin order gagal
    try {
      const now = new Date();
      const storeSetting = await prisma.storeSetting.findUnique({
        where: { id: "kofilo-store-1" },
      });

      const loyaltyEnabled = storeSetting?.loyaltyEnabled ?? true;
      const rewardPerAmount = storeSetting?.rewardPerAmount ?? 10000;
      const pointsEarned = storeSetting?.pointsEarned ?? 1;

      if (loyaltyEnabled && customerPayload.phone) {
        const earnedPoints = Math.floor(totalAmount / rewardPerAmount) * pointsEarned;
        if (earnedPoints > 0) {
          let cleanPhone = customerPayload.phone.replace(/\D/g, "");
          if (cleanPhone.startsWith("0")) {
            cleanPhone = "62" + cleanPhone.slice(1);
          } else if (cleanPhone.startsWith("8")) {
            cleanPhone = "62" + cleanPhone;
          }

          if (cleanPhone.length >= 10 && cleanPhone.length <= 14) {
            const existingCustomer = await prisma.customer.findUnique({
              where: { phone: cleanPhone },
            });

            if (existingCustomer) {
              await prisma.customer.update({
                where: { id: existingCustomer.id },
                data: {
                  points: existingCustomer.points + earnedPoints,
                  updatedAt: now,
                },
              });
            } else {
              await prisma.customer.create({
                data: {
                  phone: cleanPhone,
                  name: customerPayload.name || "-",
                  points: earnedPoints,
                  createdAt: now,
                  updatedAt: now,
                },
              });
            }
          }
        }
      }
    } catch (loyaltyErr) {
      // Loyalty gagal = jangan pernah bikin order gagal
      console.warn("[loyalty] Gagal update poin:", loyaltyErr);
    }

    // --- Buat PwaOrder ---
    // Strategy: coba create dengan customerId dulu. Jika gagal (apapun alasannya),
    // retry sekali tanpa customerId — order tetap harus masuk meskipunanonymous.
    let pwaOrder;
    try {
      pwaOrder = await prisma.pwaOrder.create({
        data: {
          tableId,
          customerId: customerPayload.sub,
          totalAmount,
          status: "PENDING_CONFIRMATION",
          paymentMethod: paymentMethod === "QRIS" || paymentMethod === "CASH" || paymentMethod === "TRANSFER" ? paymentMethod : "CASH",
          items: itemsSnapshot,
        },
      });
    } catch (createErr: any) {
      console.warn("[pwa/orders] Gagal create dengan customerId, retry tanpa:", createErr?.code, createErr?.message);
      try {
        pwaOrder = await prisma.pwaOrder.create({
          data: {
            tableId,
            customerId: undefined,
            totalAmount,
            status: "PENDING_CONFIRMATION",
            paymentMethod: paymentMethod === "QRIS" || paymentMethod === "CASH" || paymentMethod === "TRANSFER" ? paymentMethod : "CASH",
            items: itemsSnapshot,
          },
        });
      } catch (retryErr: any) {
        console.error("[pwa/orders] Gagal total create PwaOrder:", retryErr);
        return NextResponse.json(
          { message: "Gagal menyimpan pesanan", error: retryErr?.message || String(retryErr) },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Pesanan berhasil dibuat",
        orderId: pwaOrder.id,
        status: pwaOrder.status,
        totalAmount: pwaOrder.totalAmount,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/v1/pwa/orders] FATAL:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
