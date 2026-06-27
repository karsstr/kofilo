// =============================================================
// API: GET /api/v1/pwa/menus
// Public endpoint -- tidak perlu autentikasi
// Return: menu dikelompokkan per kategori, sudah diurutkan sesuai Superadmin!
// =============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Ambil kategori sesuai urutan Drag & Drop di Superadmin (sortOrder)
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" }
    });

    // 2. Ambil semua produk yang tersedia
    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      include: { category: { select: { id: true, name: true, isDrink: true } } }
    });

    // 3. Masukkan produk ke dalam "ember" kategorinya masing-masing secara berurutan
    const result = categories.map(cat => {
      const items = products
        .filter(p => p.categoryId === cat.id)
        .map(p => ({
          id: p.id, name: p.name, price: p.price, image: p.image, sku: p.sku,
          isAvailable: p.isAvailable, categoryId: p.categoryId, categoryName: cat.name, isDrink: cat.isDrink
        }));
      
      return { categoryName: cat.name, items };
    }).filter(cat => cat.items.length > 0); // Buang kategori yang kosong (tidak ada produknya)

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("[GET /api/v1/pwa/menus]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}