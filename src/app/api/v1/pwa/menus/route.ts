// =============================================================
// API: GET /api/v1/pwa/menus
// Public endpoint -- tidak perlu autentikasi
// Return: menu dikelompokkan per kategori, hanya yang isAvailable
// Response format:
// {
//   "Coffee": [{ id, name, price, image, sku }],
//   "Non-Coffee": [...],
//   ...
// }
// =============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil semua produk yang tersedia, include kategorinya
    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      include: {
        category: {
          select: { id: true, name: true, isDrink: true },
        },
      },
      orderBy: { category: { name: "asc" } },
    });

    // Kelompokkan per kategori
    const grouped: Record<
      string,
      {
        items: {
          id: string;
          name: string;
          price: number;
          image: string | null;
          sku: string | null;
          isAvailable: boolean;
          categoryId: string;
          categoryName: string;
          isDrink: boolean;
        }[];
      }
    > = {};

    for (const product of products) {
      const categoryName = product.category.name;

      if (!grouped[categoryName]) {
        grouped[categoryName] = { items: [] };
      }

      grouped[categoryName].items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        sku: product.sku,
        isAvailable: product.isAvailable,
        categoryId: product.categoryId,
        categoryName: product.category.name,
        isDrink: product.category.isDrink,
      });
    }

    // Transform ke format array yang lebih mudah dipakai FE
    const result = Object.entries(grouped).map(([categoryName, data]) => ({
      categoryName,
      items: data.items,
    }));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("[GET /api/v1/pwa/menus]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
