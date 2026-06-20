// =============================================================
// API Reward Products — /api/loyalty/rewards/route.ts
// CRUD Menu Penukaran Poin Loyalty
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// ─── GET: Ambil semua reward products ────────────────────────
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};
    const rewards = await prisma.rewardProduct.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ rewards });
  } catch (error) {
    console.error("[GET /api/loyalty/rewards]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// ─── POST: Buat reward product baru ──────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    
    // PERBAIKAN 1: Tambahkan qtyExchange agar ditangkap dari request body
    const { name, code, pointCost, qtyExchange } = body;
    
    if (!name || !code || pointCost === undefined) {
      return NextResponse.json({ message: "Nama, kode, dan point cost wajib diisi" }, { status: 400 });
    }
    const existing = await prisma.rewardProduct.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ message: "Kode menu sudah digunakan" }, { status: 400 });
    }
    
    // PERBAIKAN 2: Simpan qtyExchange ke database (default ke 1 jika kosong/0)
    const reward = await prisma.rewardProduct.create({
      data: { 
        name, 
        code, 
        pointCost: Number(pointCost), 
        qtyExchange: qtyExchange ? Number(qtyExchange) : 1 
      },
    });
    
    return NextResponse.json({ reward }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/loyalty/rewards]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT: Update reward product ───────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID wajib diisi" }, { status: 400 });
    const body = await req.json();
    const existing = await prisma.rewardProduct.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Reward tidak ditemukan" }, { status: 404 });
    // Cek duplikasi kode jika berubah
    if (body.code && body.code !== existing.code) {
      const dup = await prisma.rewardProduct.findUnique({ where: { code: body.code } });
      if (dup) return NextResponse.json({ message: "Kode menu sudah digunakan" }, { status: 400 });
    }
    const reward = await prisma.rewardProduct.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.code !== undefined && { code: body.code }),
        ...(body.pointCost !== undefined && { pointCost: Number(body.pointCost) }),
        ...(body.qtyExchange !== undefined && { qtyExchange: Number(body.qtyExchange) }),
      },
    });
    return NextResponse.json({ reward });
  } catch (error) {
    console.error("[PUT /api/loyalty/rewards]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: Hapus reward product ────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID wajib diisi" }, { status: 400 });
    const existing = await prisma.rewardProduct.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Reward tidak ditemukan" }, { status: 404 });
    await prisma.rewardProduct.delete({ where: { id } });
    return NextResponse.json({ message: "Reward berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/loyalty/rewards]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}