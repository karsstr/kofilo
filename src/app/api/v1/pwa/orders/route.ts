// =============================================================
// API: POST /api/v1/pwa/orders
// Submit pesanan dari PWA ke backend
// Wajib Bearer token dari customer
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractBearerToken, verifyPwaToken } from "@/lib/pwa-jwt";

export async function POST(req: NextRequest) {
  try {
    // --- Autentikasi ---
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) return NextResponse.json({ message: "Unauthorized: Token tidak ditemukan" }, { status: 401 });

    let customerPayload;
    try {
      customerPayload = await verifyPwaToken(token);
    } catch {
      return NextResponse.json({ message: "Unauthorized: Token tidak valid atau sudah expired" }, { status: 401 });
    }

    // --- Validasi Body ---
    const body = await req.json();
    const { tableId, items, paymentMethod } = body as {
      tableId?: string;
      paymentMethod?: string;
      items?: Array<{
        productId: string;
        id?: string;
        name: string;
        price: number;
        quantity: number;
        variants?: string;
        isReward?: boolean;
        originalPrice?: number;
      }>;
    };

    if (!tableId || typeof tableId !== "string") return NextResponse.json({ message: "tableId wajib diisi" }, { status: 400 });
    if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ message: "Keranjang kosong" }, { status: 400 });

    // Ekstrak ID Asli
    const productIdsReal = [...new Set(items.map((i) => {
      const rawId = i.productId || i.id || "";
      return rawId.replace('-reward', '');
    }))];

    // --- Hitung Total (server-side, ambil harga dari DB) ---
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIdsReal }, isAvailable: true },
      select: { id: true, price: true, name: true },
    });

    if (dbProducts.length !== productIdsReal.length) {
      return NextResponse.json({ message: "Beberapa produk tidak tersedia" }, { status: 400 });
    }

    const productPriceMap = new Map(dbProducts.map((p) => [p.id, p.price]));

    let totalAmount = 0;
    
    // 🔥 PERBAIKAN UTAMA: Deteksi cerdas barang Reward 🔥
    const itemsSnapshot = items.map((item) => {
      const rawId = item.productId || item.id || "";
      const realId = rawId.replace('-reward', '');
      const dbPrice = productPriceMap.get(realId) ?? 0;
      
      // Jika Frontend lupa mengirim isReward, kita deteksi dari ID (ada -reward) atau harga 0
      const isRewardItem = item.isReward === true || rawId.includes('-reward') || item.price === 0;
      
      // Paksa harga jadi 0 jika terdeteksi sebagai Reward
      const finalPrice = isRewardItem ? 0 : (item.price > dbPrice && item.price <= dbPrice * 2 ? item.price : dbPrice);
      const subTotal = finalPrice * item.quantity;
      
      totalAmount += subTotal;

      return {
        productId: realId,
        name: item.name + (isRewardItem && !item.name.includes('Reward') ? " (Reward)" : ""), 
        price: finalPrice,    // Rp 0 untuk Kasir
        quantity: item.quantity,
        variants: item.variants ?? null,
        subTotal: subTotal,   // Rp 0 untuk Kasir
        isReward: isRewardItem
      };
    });

    // --- Loyalty: Hitung & tambah poin jika fitur aktif ---
    try {
      const now = new Date();
      const storeSetting = await prisma.storeSetting.findUnique({
        where: { id: "kofilo-store-1" },
      });

      const loyaltyEnabled = storeSetting?.loyaltyEnabled ?? true;
      const rewardPerAmount = storeSetting?.rewardPerAmount ?? 10000;
      const pointsEarned = storeSetting?.pointsEarned ?? 1;

      if (loyaltyEnabled && customerPayload.phone) {
        // Poin HANYA dihitung dari Total Uang yang dibayar (Barang reward sudah Rp 0, jadi tidak nambah poin)
        const earnedPoints = Math.floor(totalAmount / rewardPerAmount) * pointsEarned;
        
        if (earnedPoints > 0) {
          let cleanPhone = customerPayload.phone.replace(/\D/g, "");
          if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);
          else if (cleanPhone.startsWith("8")) cleanPhone = "62" + cleanPhone;

          if (cleanPhone.length >= 10 && cleanPhone.length <= 14) {
            await prisma.customer.upsert({
              where: { phone: cleanPhone },
              update: { points: { increment: earnedPoints }, updatedAt: now },
              create: {
                phone: cleanPhone,
                name: customerPayload.name || "-",
                points: earnedPoints,
                createdAt: now,
                updatedAt: now,
              }
            });
          }
        }
      }
    } catch (loyaltyErr) {
      console.warn("[loyalty] Gagal update poin:", loyaltyErr);
    }

    // --- Buat PwaOrder (Pesanan Online untuk Kasir) ---
    let pwaOrder;
    try {
      pwaOrder = await prisma.pwaOrder.create({
        data: {
          tableId,
          customerId: customerPayload.sub,
          totalAmount, // Sudah Rp 0 jika semua barang adalah reward
          status: "PENDING_CONFIRMATION",
          paymentMethod: paymentMethod === "QRIS" || paymentMethod === "CASH" || paymentMethod === "TRANSFER" ? paymentMethod : "CASH",
          items: itemsSnapshot, // JSON ini yang dibaca Kasir, harganya sudah pasti 0
        },
      });
    } catch (createErr) {
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
    return NextResponse.json({ message: "Internal server error", error: error?.message || String(error) }, { status: 500 });
  }
}