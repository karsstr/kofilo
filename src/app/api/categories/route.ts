// =============================================================
// API Categories — /api/categories/route.ts
// GET: List kategori | POST: Tambah | PUT: Edit | DELETE: Hapus
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic'; // Hindari cache ganas Next.js

// ─── GET: Ambil semua kategori (Public) ──────────────────────
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// ─── POST: Tambah kategori baru (SUPER_ADMIN only) ───────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, isDrink } = body;

    if (!name) {
      return NextResponse.json({ message: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { 
        name, 
        isDrink: isDrink ?? false 
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT: Edit kategori (SUPER_ADMIN only) ───────────────────
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
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.isDrink !== undefined && { isDrink: body.isDrink }),
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("[PUT /api/categories]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: Hapus kategori (SUPER_ADMIN only) ───────────────
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID wajib diisi" }, { status: 400 });

    // Validasi awal: cek apakah masih ada produk dalam kategori ini
    const categoryWithCount = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!categoryWithCount) {
      return NextResponse.json({ message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    if (categoryWithCount._count.products > 0) {
      return NextResponse.json({
        message: `Gagal menghapus: Kategori ini masih memiliki ${categoryWithCount._count.products} produk. Pindahkan atau hapus produknya terlebih dahulu.`,
      }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error: any) {
    console.error("[DELETE /api/categories]", error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Gagal: Masih ada produk di dalam kategori ini. Pindahkan/hapus produknya dulu." }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}