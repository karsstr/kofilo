"use client";

// =============================================================
// Menu Management Page — (admin)/cms/products/page.tsx
// CRUD Produk, SKU, Filter Kategori, Toggle Stok (Premium Theme)
// =============================================================

import { useState, useEffect } from "react";

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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

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
    if (!confirm("Are you sure you want to delete this product?")) return;

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
    setCategoryId(categories[0]?.id || "");
    setIsAvailable(true);
    setImage("");
    setEditId(null);
    setIsCategoryDropdownOpen(false);
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
    setIsCategoryDropdownOpen(false);
    setIsOpen(true);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
    <div className="flex-1 p-8 lg:p-10 overflow-y-auto bg-[#fafbfc] text-[#1a1f36] font-sans selection:bg-[#6C4E31] selection:text-white">
      
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-[#1a1f36]">
            Menu Management
          </h1>
          <p className="text-[15px] font-medium text-gray-500 mt-1">
            Configure your digital store products, pricing, and active stock.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white px-5 py-2.5 border border-gray-200/80 rounded-2xl text-[13px] font-bold text-gray-600 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
            Today, {todayStr}
          </div>
          <button className="w-11 h-11 bg-white border border-gray-200/80 rounded-2xl flex items-center justify-center text-gray-500 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </div>

      {/* ── TOOLBAR (TABS & ADD BUTTON) ────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        
        {/* Category Tabs - pb-4 dihapus agar tinggi wadah tab pas */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide shrink-0">
          {["Coffee", "Non-Coffee", "Mocktail", "Pastry", "Dessert"].map((catName) => {
            const isActive = selectedCategoryName.toLowerCase() === catName.toLowerCase();
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategoryName(catName)}
                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-[#4A3B32] text-white border-[#4A3B32]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
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
          className="bg-[#1a1f36] hover:bg-[#2a314d] text-white px-6 py-3 rounded-2xl text-[14px] font-extrabold flex items-center gap-2.5 shadow-[0_8px_20px_-6px_rgba(26,31,54,0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add New Item
        </button>
      </div>

      {/* ── MAIN DATA TABLE ────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-[24px] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-4">
            <svg className="animate-spin h-8 w-8 text-[#6C4E31]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="font-bold text-sm">Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            <p className="text-sm font-medium">No products found in <strong className="text-gray-600">{selectedCategoryName}</strong>.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/30">
                  <th className="py-5 pl-8 pr-4 w-24">Image</th>
                  {/* pl-14 mendorong Product Name jauh ke kanan dari Image */}
                  <th className="py-5 pl-14 pr-8">Product Name</th>
                  {/* px-10 memberikan jarak renggang di kiri dan kanan SKU */}
                  <th className="py-5 px-10">SKU / Code</th>
                  {/* px-10 memberikan jarak renggang di kiri dan kanan Price */}
                  <th className="py-5 px-10">Price</th>
                  {/* pl-12 mendorong Status lebih ke kanan lagi menjauhi Price */}
                  <th className="py-5 pl-12 pr-6">Status</th>
                  <th className="py-5 pr-8 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/80">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors duration-200">
                    <td className="py-4 pl-8 pr-4 align-middle">
                      <div className="w-[52px] h-[52px] rounded-[14px] bg-white border border-gray-100 overflow-hidden flex items-center justify-center text-xl font-bold text-gray-300 shadow-sm group-hover:shadow-md transition-shadow">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          "☕"
                        )}
                      </div>
                    </td>
                    {/* Samakan padding dengan header */}
                    <td className="py-4 pl-14 pr-8 align-middle">
                      <div className="font-extrabold text-[14.5px] text-[#1a1f36] leading-tight group-hover:text-[#6C4E31] transition-colors">{p.name}</div>
                      <div className="text-[12px] font-medium text-gray-400 mt-0.5">{selectedCategoryName}</div>
                    </td>
                    {/* Samakan padding dengan header */}
                    <td className="py-4 px-10 align-middle">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 font-bold text-[11px] tracking-wider font-mono">
                        {p.sku || "N/A"}
                      </span>
                    </td>
                    {/* Samakan padding dengan header */}
                    <td className="py-4 px-10 align-middle font-black text-[14.5px] text-[#1a1f36]">
                      Rp {p.price.toLocaleString("id-ID")}
                    </td>
                    {/* Samakan padding dengan header */}
                    <td className="py-4 pl-12 pr-6 align-middle">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailable(p.id, p.isAvailable)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                            p.isAvailable ? "bg-[#6C4E31]" : "bg-gray-200"
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${
                            p.isAvailable ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                        <span className={`text-[12px] font-extrabold ${p.isAvailable ? "text-[#6C4E31]" : "text-gray-400"}`}>
                          {p.isAvailable ? "In Stock" : "Sold Out"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-8 pl-4 align-middle text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2.5 rounded-xl text-gray-400 hover:text-[#6C4E31] hover:bg-[#6C4E31]/10 transition-all duration-200"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
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

      {/* ── ADD/EDIT MODAL FORM ───────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a1f36]/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in-[0.96] duration-300 ease-out">
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-[#1a1f36] tracking-tight">
                {editId ? "Edit Item" : "Add New Item"}
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Artisan Latte"
                  className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#6C4E31]/40 focus:bg-white focus:ring-4 focus:ring-[#6C4E31]/10 transition-all duration-300 placeholder-gray-300"
                  required
                />
              </div>

              {/* SKU & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                    SKU / Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="COF-001"
                    className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#6C4E31]/40 focus:bg-white focus:ring-4 focus:ring-[#6C4E31]/10 transition-all duration-300 placeholder-gray-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                    Price (Rp)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="28000"
                    className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#6C4E31]/40 focus:bg-white focus:ring-4 focus:ring-[#6C4E31]/10 transition-all duration-300 placeholder-gray-300"
                    required
                  />
                </div>
              </div>

              {/* Category (Custom Animated Dropdown) */}
              <div className="space-y-1.5 relative">
                <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                  Category
                </label>
                
                {/* Trigger Button */}
                <div
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className={`w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] flex justify-between items-center cursor-pointer hover:border-[#6C4E31]/40 transition-all duration-300 ${isCategoryDropdownOpen ? "border-[#6C4E31]/40 ring-4 ring-[#6C4E31]/10 bg-white" : ""}`}
                >
                  <span>
                    {categoryId 
                      ? categories.find(c => c.id === categoryId)?.name 
                      : <span className="text-gray-400 font-medium">Select category...</span>}
                  </span>
                  
                  {/* Chevron Beranimasi (Berputar 180 derajat) */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" viewBox="0 0 24 24" 
                    strokeWidth={2.5} stroke="currentColor" 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${isCategoryDropdownOpen ? "rotate-180 text-[#6C4E31]" : "rotate-0"}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

                {/* Dropdown Menu Mengambang */}
                {isCategoryDropdownOpen && (
                  <>
                    {/* Layer transparan untuk menutup menu jika diklik di luar */}
                    <div 
                      className="fixed inset-0 z-[110]" 
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    />
                    
                    {/* Kotak List Dropdown */}
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[120] bg-white border border-gray-100 rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 animate-in fade-in zoom-in-[0.96] slide-in-from-top-1 duration-200 overflow-hidden">
                      <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                        {categories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setCategoryId(cat.id);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`px-5 py-3.5 text-[14px] cursor-pointer transition-all duration-200 flex items-center justify-between mx-2 rounded-xl ${
                              categoryId === cat.id 
                                ? "bg-[#6C4E31]/5 text-[#6C4E31] font-extrabold" 
                                : "text-gray-500 font-bold hover:bg-gray-50 hover:text-[#1a1f36]"
                            }`}
                          >
                            {cat.name}
                            
                            {/* Icon centang muncul di kategori yg dipilih */}
                            {categoryId === cat.id && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 animate-in zoom-in">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Product Image Upload */}
              <div className="space-y-1.5">
                <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">
                  Product Image <span className="text-gray-300 lowercase font-medium tracking-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  {/* Kotak Preview Gambar */}
                  {image ? (
                    <div className="relative w-[52px] h-[52px] rounded-[14px] border border-gray-200 overflow-hidden shrink-0 group shadow-sm">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      {/* Tombol Hapus Gambar (Muncul saat dihover) */}
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Remove Image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-[14px] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    </div>
                  )}
                  
                  {/* Tombol Upload */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-[14px] text-[14px] flex justify-center items-center cursor-pointer hover:border-[#6C4E31]/40 hover:bg-white focus-within:ring-4 focus-within:ring-[#6C4E31]/10 transition-all duration-300"
                    >
                      {image ? "Change Image" : "Upload File"}
                    </label>
                  </div>
                </div>
              </div>

              {/* Available Checkbox (Toggle style) */}
              <div className="flex items-center justify-between pt-2 pb-2">
                <div>
                  <h4 className="text-[14px] font-extrabold text-[#1a1f36]">Item is Active</h4>
                  <p className="text-[12px] text-gray-400 font-medium">Customer can see and order this item</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                    isAvailable ? "bg-[#6C4E31]" : "bg-gray-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${
                    isAvailable ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-4 rounded-2xl text-[14px] font-extrabold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-[#1a1f36] text-white py-4 rounded-2xl font-extrabold text-[14px] shadow-[0_8px_20px_-6px_rgba(26,31,54,0.3)] hover:bg-[#2a314d] hover:-translate-y-0.5 active:scale-[0.98] transition-all"
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