import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPwaToken } from "@/lib/pwa-jwt";

export async function POST(req: NextRequest) {
  try {
    // 🔥 PERBAIKAN: Prioritaskan token dari Header (Zustand) daripada Cookie lama
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || req.cookies.get("pwa_token")?.value;
    
    if (!token) return NextResponse.json({ message: "Unauthorized: Token tidak ada" }, { status: 401 });

    const decoded = await verifyPwaToken(token);
    if (!decoded || !decoded.sub) return NextResponse.json({ message: "Token tidak valid" }, { status: 401 });

    const body = await req.json();
    const { productId, pointsCost } = body;

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: decoded.sub } });
      
      // Jika error ini muncul, berarti Token-nya mengandung ID yang sudah dihapus
      if (!customer) throw new Error("Sesi tidak valid atau Pelanggan tidak ditemukan. Silakan Logout dan Login ulang.");
      if (customer.points < pointsCost) throw new Error("Poin tidak cukup");

      const updatedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: { points: { decrement: pointsCost } } 
      });
      
      return updatedCustomer;
    });

    return NextResponse.json({ 
      message: "Tukar poin berhasil", 
      customer: { id: result.id, name: result.name, points: result.points } 
    });

  } catch (error: any) {
    console.error("[POST /api/v1/pwa/rewards]", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}