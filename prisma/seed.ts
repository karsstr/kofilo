// =============================================================
// Prisma Seed — Seeding Categories, Products, Users, & Orders
// =============================================================

import { PrismaClient, Role, PaymentMethod, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning database...");
  // Hapus data lama agar seed bersih
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🌱 Seeding Users...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 1. Super Admin
  const superadmin = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      username: "superadmin",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // 2. Cashier A
  const cashierA = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      username: "budi",
      password: hashedPassword,
      role: Role.CASHIER,
    },
  });

  // 3. Cashier B
  const cashierB = await prisma.user.create({
    data: {
      name: "Siti Rahma",
      username: "siti",
      password: hashedPassword,
      role: Role.CASHIER,
    },
  });

  console.log("🌱 Seeding Categories...");
  const catCoffee = await prisma.category.create({ data: { name: "Coffee" } });
  const catNonCoffee = await prisma.category.create({ data: { name: "Non-Coffee" } });
  const catMocktail = await prisma.category.create({ data: { name: "Mocktail" } });
  const catPastry = await prisma.category.create({ data: { name: "Pastry" } });
  const catDessert = await prisma.category.create({ data: { name: "Dessert" } });
  const catAddon = await prisma.category.create({ data: { name: "Add-on" } });
  const catSpecialty = await prisma.category.create({ data: { name: "Specialty" } });
  const catSnack = await prisma.category.create({ data: { name: "Snack" } });

  console.log("🌱 Seeding Products...");
  const productsData = [
    // Coffee
    { name: "Artisan Latte", price: 27000, sku: "COF-001", isAvailable: true, categoryId: catCoffee.id },
    { name: "Malty Latte", price: 30000, sku: "COF-002", isAvailable: true, categoryId: catCoffee.id },
    { name: "Iced Caramel Macchiato", price: 32000, sku: "COF-003", isAvailable: true, categoryId: catCoffee.id },
    { name: "Cold Brew", price: 25000, sku: "COF-004", isAvailable: false, categoryId: catCoffee.id },
    { name: "Americano", price: 20000, sku: "COF-005", isAvailable: true, categoryId: catCoffee.id },
    
    // Non-Coffee
    { name: "Matcha Frappe", price: 35000, sku: "NCF-001", isAvailable: true, categoryId: catNonCoffee.id },
    { name: "Earl Grey Tea", price: 22000, sku: "NCF-002", isAvailable: true, categoryId: catNonCoffee.id },
    
    // Add-on
    { name: "Almond Milk Substitute", price: 10000, sku: "ADD-001", isAvailable: true, categoryId: catAddon.id },
    
    // Pastry
    { name: "Butter Croissant", price: 20000, sku: "PAS-001", isAvailable: true, categoryId: catPastry.id },
    { name: "Vegan Brownie", price: 24000, sku: "PAS-002", isAvailable: true, categoryId: catPastry.id },
    
    // Specialty
    { name: "Cascara Fizz", price: 28000, sku: "SPC-001", isAvailable: true, categoryId: catSpecialty.id },
    
    // Snack / Dessert
    { name: "Matcha Cookies", price: 15000, sku: "DES-001", isAvailable: true, categoryId: catDessert.id },
  ];

  const products: any[] = [];
  for (const p of productsData) {
    const created = await prisma.product.create({ data: p });
    products.push(created);
  }

  console.log("🌱 Seeding Mock Sales/Orders for Dashboard Stats...");
  // Kami ingin mensimulasikan Total Sales = Rp 4.500.000 dengan 150 Completed Orders
  // 150 order dengan rata-rata Rp 30.000 per order = Rp 4.500.000
  const totalOrdersToCreate = 150;
  const targetRevenue = 4500000;
  const basePricePerOrder = Math.floor(targetRevenue / totalOrdersToCreate); // Rp 30.000

  // Buat order secara bulk menggunakan Prisma transaction
  const ordersData: any[] = [];

  for (let i = 1; i <= totalOrdersToCreate; i++) {
    // Tentukan produk random
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    // Tentukan kasir secara random
    const cashier = i % 2 === 0 ? cashierA : cashierB;
    // Tentukan metode pembayaran random
    const paymentMethod = i % 3 === 0 ? PaymentMethod.QRIS : i % 3 === 1 ? PaymentMethod.TRANSFER : PaymentMethod.CASH;
    
    // Kita paksakan agar totalAmount persis mendekati targetRevenue pada akhirnya
    const finalPrice = i === totalOrdersToCreate 
      ? targetRevenue - (basePricePerOrder * (totalOrdersToCreate - 1)) 
      : basePricePerOrder;

    ordersData.push({
      totalAmount: finalPrice,
      paymentMethod,
      status: OrderStatus.COMPLETED,
      cashierId: cashier.id,
      createdAt: new Date(Date.now() - (totalOrdersToCreate - i) * 10 * 60 * 1000), // Berurutan ke belakang
    });
  }

  // Tulis order ke database
  for (let idx = 0; idx < ordersData.length; idx++) {
    const oData = ordersData[idx];
    const createdOrder = await prisma.order.create({
      data: {
        totalAmount: oData.totalAmount,
        paymentMethod: oData.paymentMethod,
        status: oData.status,
        cashierId: oData.cashierId,
        createdAt: oData.createdAt,
        orderItems: {
          create: {
            productId: products[idx % products.length].id, // Distribusikan item
            quantity: 1,
            subTotal: oData.totalAmount,
          }
        }
      }
    });
  }

  console.log("✅ Super Admin created: superadmin / admin123");
  console.log("✅ Cashier accounts created: budi / admin123, siti / admin123");
  console.log(`✅ Categories seeded: Coffee, Non-Coffee, Mocktail, Pastry, Dessert, Add-on, Specialty, Snack`);
  console.log(`✅ Seeded ${products.length} products with SKUs.`);
  console.log(`✅ Seeded ${totalOrdersToCreate} completed orders for dashboard metrics.`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
