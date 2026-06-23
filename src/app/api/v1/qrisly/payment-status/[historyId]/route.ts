// =============================================================
// API: GET /api/v1/qrisly/payment-status/[historyId]
// Cek status pembayaran QRIS via QRISLY
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getQrisPaymentStatus } from "@/lib/qrisly";

export async function GET(
  req: NextRequest,
  { params }: { params: { historyId: string } }
) {
  try {
    const historyId = Number(params.historyId);
    if (isNaN(historyId)) {
      return NextResponse.json(
        { message: "historyId harus berupa angka" },
        { status: 400 }
      );
    }

    const result = await getQrisPaymentStatus(historyId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/v1/qrisly/payment-status/:historyId]", error);
    return NextResponse.json(
      { message: error?.message || "Gagal mengambil status QRIS" },
      { status: 500 }
    );
  }
}