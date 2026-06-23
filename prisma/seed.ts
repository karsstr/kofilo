// =============================================================
// Prisma Seed -- Seeding Categories, Products, Users, Orders,
// Customers, Reward Products & Store Settings
// =============================================================

import { PrismaClient, Role, PaymentMethod, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning database...");
  await prisma.pwaRedeem.deleteMany({});
  await prisma.pwaOrder.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.rewardProduct.deleteMany({});
  await prisma.storeSetting.deleteMany({});

  // ========== USERS ==========
  console.log("🌱 Seeding Users...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: { name: "Alex Morgan", username: "superadmin", password: hashedPassword, role: Role.SUPER_ADMIN },
  });
  const cashierA = await prisma.user.create({
    data: { name: "Budi Santoso", username: "budi", password: hashedPassword, role: Role.CASHIER },
  });
  const cashierB = await prisma.user.create({
    data: { name: "Siti Rahma", username: "siti", password: hashedPassword, role: Role.CASHIER },
  });

  // ========== CATEGORIES ==========
  console.log("🌱 Seeding Categories...");
  const catCoffee = await prisma.category.create({ data: { name: "Coffee" } });
  const catNonCoffee = await prisma.category.create({ data: { name: "Non-Coffee" } });
  const catMocktail = await prisma.category.create({ data: { name: "Mocktail" } });
  const catPastry = await prisma.category.create({ data: { name: "Pastry" } });
  const catDessert = await prisma.category.create({ data: { name: "Dessert" } });
  const catAddon = await prisma.category.create({ data: { name: "Add-on" } });
  const catSpecialty = await prisma.category.create({ data: { name: "Specialty" } });
  const catSnack = await prisma.category.create({ data: { name: "Snack" } });

  // ========== PRODUCTS ==========
  console.log("🌱 Seeding Products...");
  const productsData = [
    { name: "Artisan Latte", price: 27000, sku: "COF-001", isAvailable: true, categoryId: catCoffee.id },
    { name: "Malty Latte", price: 30000, sku: "COF-002", isAvailable: true, categoryId: catCoffee.id },
    { name: "Iced Caramel Macchiato", price: 32000, sku: "COF-003", isAvailable: true, categoryId: catCoffee.id },
    { name: "Cold Brew", price: 25000, sku: "COF-004", isAvailable: false, categoryId: catCoffee.id },
    { name: "Americano", price: 20000, sku: "COF-005", isAvailable: true, categoryId: catCoffee.id },
    { name: "Matcha Frappe", price: 35000, sku: "NCF-001", isAvailable: true, categoryId: catNonCoffee.id },
    { name: "Earl Grey Tea", price: 22000, sku: "NCF-002", isAvailable: true, categoryId: catNonCoffee.id },
    { name: "Almond Milk Substitute", price: 10000, sku: "ADD-001", isAvailable: true, categoryId: catAddon.id },
    { name: "Butter Croissant", price: 20000, sku: "PAS-001", isAvailable: true, categoryId: catPastry.id },
    { name: "Vegan Brownie", price: 24000, sku: "PAS-002", isAvailable: true, categoryId: catPastry.id },
    { name: "Cascara Fizz", price: 28000, sku: "SPC-001", isAvailable: true, categoryId: catSpecialty.id },
    { name: "Matcha Cookies", price: 15000, sku: "DES-001", isAvailable: true, categoryId: catDessert.id },
  ];

  const products: any[] = [];
  for (const p of productsData) {
    const created = await prisma.product.create({ data: p });
    products.push(created);
  }

  // ========== STORE SETTINGS ==========
  console.log("🌱 Seeding Store Settings...");
  await prisma.storeSetting.create({
    data: {
      id: "kofilo-store-1",
      storeName: "Kofilo Craft Coffee",
      description: "Craft Coffee & Workspace terbaik di kota",
      phone: "6281234567890",
      email: "hello@kofilo.com",
      instagram: "@kofilo.coffee",
      address: "Jl. Senopati No. 42, Jakarta Selatan",
      operatingHours: "Senin - Minggu, 08:00 - 22:00",
      isStoreOpen: true,
      taxRate: 0,
      serviceCharge: 5,
      minOrderAmount: 0,
      acceptCash: true,
      acceptQris: true,
      acceptTransfer: false,
      loyaltyEnabled: true,
      rewardPerAmount: 10000,
      pointsEarned: 1,
      registrationPoints: 10,
      pointsExpiryDays: 365,
      receiptFooter: "Terima kasih atas kunjungannya! Follow IG kami @kofilo.coffee",
      wifiPassword: "kofilo@2024",
    },
  });

  // ========== CUSTOMERS (LOYALTY DUMMY) ==========
  console.log("🌱 Seeding Customers (Loyalty Program)...");
  const customerDummies = [
    { phone: "6281234567890", name: "Rina Wijaya", points: 250 },
    { phone: "6281345678901", name: "Dimas Pratama", points: 180 },
    { phone: "6281456789012", name: "Sari Indah", points: 95 },
    { phone: "6281567890123", name: "Bambang Suprapto", points: 320 },
    { phone: "6281678901234", name: "Dewi Lestari", points: 60 },
  ];

  for (const c of customerDummies) {
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: { points: c.points },
      create: c,
    });
  }
  console.log(`✅ Seeded ${customerDummies.length} customers`);

  // ========== REWARD PRODUCTS ==========
  console.log("🌱 Seeding Reward Products (Menu Penukaran Poin)...");
  const rewardsData = [
    { name: "Free Americano", code: "RWR-001", pointCost: 25, qtyExchange: 50 },
    { name: "Free Artisan Latte", code: "RWR-002", pointCost: 35, qtyExchange: 30 },
    { name: "Free Butter Croissant", code: "RWR-003", pointCost: 20, qtyExchange: 40 },
    { name: "Free Matcha Frappe", code: "RWR-004", pointCost: 50, qtyExchange: 15 },
    { name: "Voucher Diskon 20%", code: "RWR-005", pointCost: 100, qtyExchange: 10 },
    { name: "Free Cold Brew", code: "RWR-006", pointCost: 30, qtyExchange: 25 },
  ];

  for (const r of rewardsData) {
    await prisma.rewardProduct.create({ data: r });
  }
  console.log(`✅ Seeded ${rewardsData.length} reward products`);

  // ========== MOCK ORDERS ==========
  console.log("🌱 Seeding Mock Sales/Orders for Dashboard Stats...");
  const totalOrdersToCreate = 150;
  const targetRevenue = 4500000;
  const basePricePerOrder = Math.floor(targetRevenue / totalOrdersToCreate);

  for (let i = 1; i <= totalOrdersToCreate; i++) {
    const cashier = i % 2 === 0 ? cashierA : cashierB;
    const paymentMethod = i % 3 === 0 ? PaymentMethod.QRIS : i % 3 === 1 ? PaymentMethod.TRANSFER : PaymentMethod.CASH;
    const finalPrice = i === totalOrdersToCreate
      ? targetRevenue - (basePricePerOrder * (totalOrdersToCreate - 1))
      : basePricePerOrder;

    await prisma.order.create({
      data: {
        totalAmount: finalPrice,
        paymentMethod,
        status: OrderStatus.COMPLETED,
        cashierId: cashier.id,
        createdAt: new Date(Date.now() - (totalOrdersToCreate - i) * 10 * 60 * 1000),
        orderItems: {
          create: {
            productId: products[i % products.length].id,
            quantity: 1,
            subTotal: finalPrice,
          },
        },
      },
    });
  }

  console.log("✅ Super Admin: superadmin / admin123");
  console.log("✅ Cashier: budi / admin123, siti / admin123");
  console.log(`✅ ${products.length} products`);
  console.log(`✅ ${totalOrdersToCreate} completed orders`);
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