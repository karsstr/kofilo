// =============================================================
// API: POST /api/v1/pwa/redeem
// Menukarkan poin customer dengan reward product
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractBearerToken, verifyPwaToken } from "@/lib/pwa-jwt";

export const dynamic = 'force-dynamic';

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
    const { rewardProductId } = body as { rewardProductId?: string };

    if (!rewardProductId) {
      return NextResponse.json(
        { message: "rewardProductId wajib diisi" },
        { status: 400 }
      );
    }

    // --- Proses Redeem dalam Transaction ---
    const result = await prisma.$transaction(async (tx) => {
      // Ambil data customer
      const customer = await tx.customer.findUnique({
        where: { id: customerPayload.sub },
      });

      if (!customer) {
        throw new Error("Customer tidak ditemukan");
      }

      // Ambil data reward product
      const reward = await tx.rewardProduct.findUnique({
        where: { id: rewardProductId },
      });

      if (!reward) {
        throw new Error("Reward tidak ditemukan");
      }

      // Cek kecukupan poin
      if (customer.points < reward.pointCost) {
        throw new Error(
          `Poin tidak mencukupi. Dibutuhkan ${reward.pointCost}, saat ini ${customer.points}`
        );
      }

      // Kurangi poin customer
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          points: customer.points - reward.pointCost,
          updatedAt: new Date(),
        },
      });

      // Catat riwayat redeem
      const redeem = await tx.pwaRedeem.create({
        data: {
          customerId: customer.id,
          rewardProductId: reward.id,
          pointSpent: reward.pointCost,
        },
        include: {
          reward: { select: { id: true, name: true, code: true, pointCost: true } },
        },
      });

      return { redeem, pointsRemaining: customer.points - reward.pointCost };
    });

    return NextResponse.json(
      {
        message: "Penukaran poin berhasil!",
        redeem: result.redeem,
        pointsRemaining: result.pointsRemaining,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/v1/pwa/redeem]", error);
    const message = error.message || "Internal server error";
    return NextResponse.json({ message }, { status: 400 });
  }
}