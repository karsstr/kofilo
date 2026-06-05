"use client";

// =============================================================
// Cashier Page — (pos)/cashier/page.tsx
// POS interface with real-time Category filtering & Cart checkout
// =============================================================

import { useState, useEffect, useCallback } from "react";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  isAvailable: boolean;
  category: { name: string };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER">("CASH");

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (err) {
      console.error("Gagal memuat produk:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (!product.isAvailable) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCartItems([]);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckoutLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            subTotal: item.product.price * item.quantity,
          })),
          totalAmount,
        }),
      });

      if (res.ok) {
        alert("✅ Order completed successfully!");
        clearCart();
      } else {
        const err = await res.json();
        alert(`❌ Checkout failed: ${err.message}`);
      }
    } catch {
      alert("❌ A network error occurred during checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Filter products by selected category tab
  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter((p) => p.category.name.toLowerCase() === selectedCategory.toLowerCase());

  // Available categories list
  const categoryTabs = ["All", "Coffee", "Non-Coffee", "Mocktail", "Pastry", "Dessert"];

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fdfdfd] text-[#171717]">
      {/* ── LEFT SECTION: Product Catalog ── */}
      <section className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col">
        {/* POS Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Caffeine Hub POS</h1>
            <p className="text-sm text-gray-500">Add items to order, select payment and process sales.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl">
              📅 {todayStr}
            </span>
            <a
              href="/api/auth/logout"
              className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 px-3.5 py-2 rounded-xl transition-all"
            >
              Sign Out
            </a>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
          {categoryTabs.map((tab) => {
            const isActive = selectedCategory.toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setSelectedCategory(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[#3f624c] text-white shadow-sm border border-[#3f624c]"
                    : "bg-white text-gray-500 hover:text-gray-900 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Grid Area */}
        <div className="flex-1">
          {loadingProducts ? (
            <div className="flex items-center justify-center h-64 text-gray-400 font-semibold">
              Loading catalog items...
            </div>
          ) : (
            <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
          )}
        </div>
      </section>

      {/* ── RIGHT SECTION: Cart panel ── */}
      <aside className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col shadow-sm">
        <Cart
          items={cartItems}
          totalAmount={totalAmount}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
          onCheckout={handleCheckout}
          checkoutLoading={checkoutLoading}
        />
      </aside>
    </div>
  );
}
