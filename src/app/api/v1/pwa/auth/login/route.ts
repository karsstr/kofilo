// =============================================================
// API: POST /api/v1/pwa/auth/login
// Autentikasi pelanggan PWA via nomor HP & Nama
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signPwaToken } from "@/lib/pwa-jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, name } = body as { phone?: string; name?: string };

    // --- Validasi Input ---
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { message: "Nomor HP wajib diisi" },
        { status: 400 }
      );
    }

    // Sanitasi: hanya angka
    let cleanPhone = phone.replace(/\D/g, "");

    // Format nomor HP ke format 62 (konsisten dengan order route)
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("8")) {
      cleanPhone = "62" + cleanPhone;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 14) {
      return NextResponse.json(
        { message: "Nomor HP harus terdiri dari 10-13 angka" },
        { status: 400 }
      );
    }

    // --- Cek atau buat Customer ---
    let isNewMember = false;
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      // Validasi tambahan untuk member baru: Harus punya nama
      if (!name || name.trim() === "") {
        return NextResponse.json(
          { message: "Nama lengkap wajib diisi untuk pendaftaran awal" },
          { status: 400 }
        );
      }

      // Ambil setting poin pendaftaran
      const settings = await prisma.storeSetting.findFirst();
      const bonusPoints = settings?.registrationPoints ?? 0;

      // Auto-register: buat customer baru dengan bonus poin
      customer = await prisma.customer.create({
        data: {
          phone: cleanPhone,
          name: name.trim(),
          points: bonusPoints,
        },
      });
      isNewMember = true;
    }

    // Jika customer sudah ada tapi masih bernama "-" (dari POS), update namanya
    if (!isNewMember && customer.name === "-" && name && name.trim() !== "") {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name: name.trim() },
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