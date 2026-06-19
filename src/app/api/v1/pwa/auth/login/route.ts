// =============================================================
// API: POST /api/v1/pwa/auth/login
// Autentikasi pelanggan PWA via nomor HP
// Logic:
//   - Cek tabel customers
//   - Jika ada -> return data + JWT
//   - Jika tidak ada -> buat baru (auto-register) -> return token
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signPwaToken } from "@/lib/pwa-jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body as { phone?: string };

    // --- Validasi Input ---
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { message: "Nomor HP wajib diisi" },
        { status: 400 }
      );
    }

    // Sanitasi: hanya angka, 10-13 digit
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      return NextResponse.json(
        { message: "Nomor HP harus terdiri dari 10-13 angka" },
        { status: 400 }
      );
    }

    // --- Cek atau buat Customer ---
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      // Auto-register: buat customer baru
      customer = await prisma.customer.create({
        data: {
          phone: cleanPhone,
          name: `Guest ${cleanPhone}`,
          points: 0,
        },
      });
    }

    // --- Sign JWT ---
    const token = await signPwaToken({
      sub: customer.id,
      phone: customer.phone,
      name: customer.name,
    });

    return NextResponse.json({
      message: "Login berhasil",
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        points: customer.points,
      },
    });
  } catch (error) {
    console.error("[POST /api/v1/pwa/auth/login]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
