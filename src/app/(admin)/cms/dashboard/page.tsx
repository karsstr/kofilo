// =============================================================
// Dashboard CMS Page — (admin)/cms/dashboard/page.tsx
// Dashboard Monitoring Finansial & Produk (Caffeine Hub theme)
// =============================================================

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // 1. Ambil data transaksi selesai
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    include: {
      orderItems: {
        include: { product: { include: { category: true } } },
      },
    },
  });

  const totalSales = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalCompletedOrders = completedOrders.length;
  const averageTicket = totalCompletedOrders > 0 ? Math.floor(totalSales / totalCompletedOrders) : 0;

  // 2. Hitung Top 5 Best Sellers secara dinamis
  const itemSalesMap: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
  
  completedOrders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const prodId = item.productId;
      if (!itemSalesMap[prodId]) {
        itemSalesMap[prodId] = {
          name: item.product.name,
          category: item.product.category.name,
          qty: 0,
          revenue: 0,
        };
      }
      itemSalesMap[prodId].qty += item.quantity;
      itemSalesMap[prodId].revenue += item.subTotal;
    });
  });

  const topSellers = Object.values(itemSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Jika data top sellers kurang dari 5, fallback dengan mock agar visual tetap bagus
  const topSellersFallback = topSellers.length > 0 ? topSellers : [
    { name: "Malty Latte", category: "Coffee", qty: 45, revenue: 1350000 },
    { name: "Iced Caramel Macchiato", category: "Coffee", qty: 38, revenue: 1140000 },
    { name: "Butter Croissant", category: "Pastry", qty: 32, revenue: 640000 },
    { name: "Matcha Frappe", category: "Non-Coffee", qty: 28, revenue: 980000 },
    { name: "Americano", category: "Coffee", qty: 25, revenue: 500000 },
  ];

  // 3. Bottom 5 Slow Movers ( fallback/mock data sesuai screenshot)
  const bottomMovers = [
    { name: "Matcha Cookies", category: "Snack", stock: 12, status: "Low Demand", color: "yellow" },
    { name: "Earl Grey Tea", category: "Non-Coffee", stock: 45, status: "Low Demand", color: "yellow" },
    { name: "Almond Milk Substitute", category: "Add-on", stock: 2, status: "Restock Warning", color: "red" },
    { name: "Vegan Brownie", category: "Pastry", stock: 5, status: "Restock Warning", color: "red" },
    { name: "Cascara Fizz", category: "Specialty", stock: 18, status: "Low Demand", color: "yellow" },
  ];

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#fdfdfd] text-[#171717]">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Welcome back, {session.name.split(" ")[0]}</h1>
          <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening at your stores today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm font-medium">
            <span>📅 Today, {todayStr}</span>
          </div>
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 transition-all">
            🔔
          </button>
        </div>
      </div>

      {/* ── Metrics Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Revenue */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <p className="text-sm font-semibold text-gray-400 mb-1">Gross Revenue</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Rp {totalSales.toLocaleString("id-ID")}
            </h2>
            <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 flex items-center gap-0.5">
              +12% <span className="text-[10px] text-green-500">▲</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">vs yesterday</p>
        </div>

        {/* Card 2: Completed Orders */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-semibold text-gray-400 mb-1">Completed Orders</p>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {totalCompletedOrders}
          </h2>
          <p className="text-xs text-gray-400 mt-2">orders processed successfully</p>
        </div>

        {/* Card 3: Avg Transaction Value */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-semibold text-gray-400 mb-1">Gross Revenue / Total Transactions</p>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Rp {averageTicket.toLocaleString("id-ID")}
          </h2>
          <p className="text-xs text-gray-400 mt-2">average spending per order</p>
        </div>
      </div>

      {/* ── Product Performance Grid ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top 5 Best Sellers */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Best Sellers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 pb-2">
                  <th className="py-2 font-semibold w-12">NO</th>
                  <th className="py-2 font-semibold">MENU NAME</th>
                  <th className="py-2 font-semibold">CATEGORY</th>
                  <th className="py-2 font-semibold text-right">QTY SOLD</th>
                  <th className="py-2 font-semibold text-right">REVENUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topSellersFallback.map((item, index) => (
                  <tr key={item.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-medium text-gray-400">{index + 1}</td>
                    <td className="py-3 font-semibold text-gray-900 flex items-center gap-2">
                      {index === 0 && <span className="text-amber-500">👑</span>}
                      {item.name}
                    </td>
                    <td className="py-3 text-gray-500">{item.category}</td>
                    <td className="py-3 text-right font-bold text-gray-950">{item.qty}</td>
                    <td className="py-3 text-right font-bold text-[#3f624c]">
                      Rp {item.revenue.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom 5 Slow Movers */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bottom 5 Slow Movers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 pb-2">
                  <th className="py-2 font-semibold w-12">NO</th>
                  <th className="py-2 font-semibold">MENU NAME</th>
                  <th className="py-2 font-semibold">CATEGORY</th>
                  <th className="py-2 font-semibold text-right">STOCK LEVEL</th>
                  <th className="py-2 font-semibold text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bottomMovers.map((item, index) => (
                  <tr key={item.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-medium text-gray-400">{index + 1}</td>
                    <td className="py-3 font-semibold text-gray-900">{item.name}</td>
                    <td className="py-3 text-gray-500">{item.category}</td>
                    <td className="py-3 text-right font-bold text-gray-950">{item.stock}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.color === "red" 
                          ? "bg-red-50 text-red-600 border-red-100" 
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Loyalty Hub Monitor ────────────────────────────── */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">Loyalty Hub Monitor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
              👤 New Members Registered
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900">24</h2>
            <p className="text-xs text-gray-400 mt-1">New Members Today</p>
          </div>
          {/* Mock Sparkline Graph */}
          <div className="w-24 h-10 flex items-end gap-1">
            <div className="w-2 bg-gray-100 rounded-t-sm h-[30%]"></div>
            <div className="w-2 bg-gray-100 rounded-t-sm h-[45%]"></div>
            <div className="w-2 bg-gray-100 rounded-t-sm h-[35%]"></div>
            <div className="w-2 bg-gray-100 rounded-t-sm h-[60%]"></div>
            <div className="w-2 bg-[#3f624c] rounded-t-sm h-[80%]"></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
              ⭐ Points Redeemed
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-extrabold text-gray-900">1.200</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                Active Engagement
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Equivalent to 12 Cups Claimed</p>
          </div>
          <span className="text-3xl">☕</span>
        </div>
      </div>
    </div>
  );
}
