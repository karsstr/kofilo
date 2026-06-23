// =============================================================
// API: GET /api/v1/pwa/redeem/history
// Riwayat penukaran poin customer
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractBearerToken, verifyPwaToken } from "@/lib/pwa-jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    // Ambil riwayat redeem
    const redemptions = await prisma.pwaRedeem.findMany({
      where: { customerId: customerPayload.sub },
      include: {
        reward: { select: { id: true, name: true, code: true, pointCost: true } },
      },
      orderBy: { redeemedAt: "desc" },
    });

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("[GET /api/v1/pwa/redeem/history]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}