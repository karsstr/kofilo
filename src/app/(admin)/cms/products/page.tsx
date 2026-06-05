"use client";

// =============================================================
// Menu Management Page — (admin)/cms/products/page.tsx
// CRUD Produk, SKU, Filter Kategori, Toggle Stok (Caffeine Hub theme)
// =============================================================

import { useState, useEffect, startTransition } from "react";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  sku: string | null;
  image: string | null;
  isAvailable: boolean;
  categoryId: string;
  category?: Category;
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("Coffee");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState("");

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Fetch initial categories and products
  useEffect(() => {
    async function initData() {
      try {
        const resCat = await fetch("/api/categories");
        const dataCat = await resCat.json();
        setCategories(dataCat.categories || []);

        const resProd = await fetch("/api/products");
        const dataProd = await resProd.json();
        setProducts(dataProd.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Filter products by selected category tab name
  const filteredProducts = products.filter(
    (p) => p.category?.name.toLowerCase() === selectedCategoryName.toLowerCase()
  );

  // Toggle availability status
  async function handleToggleAvailable(id: string, currentVal: boolean) {
    const updatedVal = !currentVal;
    
    // Optimistic UI Update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: updatedVal } : p))
    );

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: updatedVal }),
      });
      if (!res.ok) throw new Error("Gagal update stok");
    } catch (err) {
      alert("Gagal mengupdate ketersediaan produk");
      // Rollback UI
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isAvailable: currentVal } : p))
      );
    }
  }

  // Delete product
  async function handleDeleteProduct(id: string) {
    if (!confirm("Hapus produk ini?")) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Open Add Modal
  function openAddModal() {
    setName("");
    setPrice("");
    setSku("");
    // Default to first category if available
    setCategoryId(categories[0]?.id || "");
    setIsAvailable(true);
    setImage("");
    setEditId(null);
    setIsOpen(true);
  }

  // Open Edit Modal
  function openEditModal(p: Product) {
    setName(p.name);
    setPrice(p.price.toString());
    setSku(p.sku || "");
    setCategoryId(p.categoryId);
    setIsAvailable(p.isAvailable);
    setImage(p.image || "");
    setEditId(p.id);
    setIsOpen(true);
  }

  // Submit Form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !price || !categoryId) {
      alert("Nama, harga, dan kategori wajib diisi");
      return;
    }

    const payload = {
      name,
      price: Number(price),
      sku: sku || null,
      categoryId,
      isAvailable,
      image: image || null,
    };

    try {
      if (editId) {
        // Edit Mode
        const res = await fetch(`/api/products?id=${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setProducts((prev) =>
            prev.map((p) => (p.id === editId ? data.product : p))
          );
          setIsOpen(false);
        } else {
          alert("Gagal menyimpan perubahan");
        }
      } else {
        // Add Mode
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setProducts((prev) => [...prev, data.product]);
          setIsOpen(false);
        } else {
          alert("Gagal menambahkan produk");
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#fdfdfd] text-[#171717]">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Menu Management</h1>
          <p className="text-sm text-gray-500">Configure your digital store products, pricing, and active stock.</p>
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

      {/* ── Toolbar (Tabs & Add Button) ───────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {["Coffee", "Non-Coffee", "Mocktail", "Pastry", "Dessert"].map((catName) => {
            const isActive = selectedCategoryName.toLowerCase() === catName.toLowerCase();
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategoryName(catName)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#3f624c] text-white shadow-sm border border-[#3f624c]"
                    : "bg-white text-gray-500 hover:text-gray-900 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Add New Item Button */}
        <button
          onClick={openAddModal}
          className="bg-[#3f624c] hover:bg-[#324f3c] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all duration-200"
        >
          <span className="text-lg leading-none">+</span> Add New Item
        </button>
      </div>

      {/* ── Main Data Table ────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No products found in category <strong>{selectedCategoryName}</strong>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                  <th className="py-3.5 px-6 font-semibold w-12 text-center">
                    <input type="checkbox" className="rounded border-gray-300 accent-[#3f624c]" />
                  </th>
                  <th className="py-3.5 px-4 font-semibold">IMAGE</th>
                  <th className="py-3.5 px-4 font-semibold">PRODUCT NAME</th>
                  <th className="py-3.5 px-4 font-semibold">SKU / CODE</th>
                  <th className="py-3.5 px-4 font-semibold">PRICE</th>
                  <th className="py-3.5 px-4 font-semibold">STOCK STATUS</th>
                  <th className="py-3.5 px-6 font-semibold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-4 px-6 text-center">
                      <input type="checkbox" className="rounded border-gray-300 accent-[#3f624c]" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-lg font-bold text-gray-400">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          "☕"
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900">{p.name}</td>
                    <td className="py-4 px-4 font-semibold text-gray-500 tracking-wider">
                      {p.sku || "-"}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900">
                      Rp {p.price.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {/* Toggle Switch */}
                        <button
                          onClick={() => handleToggleAvailable(p.id, p.isAvailable)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                            p.isAvailable ? "bg-[#3f624c]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 transform ${
                              p.isAvailable ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-semibold ${p.isAvailable ? "text-green-700" : "text-gray-400"}`}>
                          {p.isAvailable ? "Active/In Stock" : "Sold Out"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(p)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal Form ───────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-gray-200 shadow-xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editId ? "Edit Menu Item" : "Add New Menu Item"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Artisan Latte"
                  className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3f624c]"
                  required
                />
              </div>

              {/* SKU & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                    SKU / Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. COF-001"
                    className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3f624c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                    Price (Rp)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 27000"
                    className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3f624c]"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3f624c]"
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3f624c]"
                />
              </div>

              {/* Available Checkbox */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="avail"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded border-gray-300 accent-[#3f624c] w-4 h-4"
                />
                <label htmlFor="avail" className="text-sm font-semibold text-gray-700">
                  Item is Active / In Stock
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3f624c] hover:bg-[#324f3c] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
