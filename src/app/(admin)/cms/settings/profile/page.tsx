"use client";

import { useState, useEffect } from "react";

export default function StoreProfilePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success" as "success" | "error", message: "" });

  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    phone: "",
    email: "",
    instagram: "",
    tiktok: "",
    logo: "",
    banner: "",
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  // Ambil Data Saat Pertama Kali Render
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/settings/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setFormData({
              storeName: data.settings.storeName || "",
              description: data.settings.description || "",
              phone: data.settings.phone || "",
              email: data.settings.email || "",
              instagram: data.settings.instagram || "",
              tiktok: data.settings.tiktok || "",
              logo: data.settings.logo || "",
              banner: data.settings.banner || "",
            });
          }
        }
      } catch (error) {
        console.error("Gagal load profil toko", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fungsi Konversi File Gambar ke Base64 (Agar mudah disimpan di database langsung)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("error", "Ukuran gambar maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Simpan Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      showToast("success", "Profil toko berhasil disimpan!");
    } catch (error: any) {
      showToast("error", error.message || "Gagal menyimpan perubahan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-10 flex flex-col items-center justify-center text-[#6C4E31] gap-4 h-full">
        <div className="w-8 h-8 border-4 border-[#6C4E31] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold animate-pulse">Memuat Profil Toko...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 lg:p-10 overflow-y-auto bg-[#fafbfc] text-[#1a1f36] font-sans">
      
      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-[28px] font-black tracking-tight text-[#1a1f36]">Store Profile</h1>
        <p className="text-[15px] font-medium text-gray-500 mt-1">Atur identitas utama tokomu yang akan dilihat oleh pelanggan di PWA.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
        
        {/* ── SECTION 1: VISUAL BRANDING ── */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-black mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-lg">✨</span>
            Visual Branding
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Logo Toko (1:1)</label>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-[20px] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-40">☕</span>
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" id="logo-upload" accept="image/*" onChange={(e) => handleImageUpload(e, "logo")} className="hidden" />
                  <label htmlFor="logo-upload" className="inline-block bg-white border border-gray-200 text-[#1a1f36] font-bold rounded-xl px-4 py-2 text-[13px] cursor-pointer hover:bg-gray-50 transition-colors">
                    Pilih Logo Baru
                  </label>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Disarankan PNG/JPG transparan. Maks 2MB.</p>
                </div>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-3">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Banner PWA (16:9)</label>
              <div className="flex flex-col gap-3">
                <div className="w-full h-24 rounded-[16px] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group">
                  {formData.banner ? (
                    <>
                      <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label htmlFor="banner-upload" className="text-white text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm cursor-pointer">Ubah Banner</label>
                      </div>
                    </>
                  ) : (
                    <label htmlFor="banner-upload" className="text-gray-400 text-xs font-bold cursor-pointer w-full h-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                      + Tambah Banner
                    </label>
                  )}
                </div>
                <input type="file" id="banner-upload" accept="image/*" onChange={(e) => handleImageUpload(e, "banner")} className="hidden" />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: BASIC INFO ── */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-black mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-lg">📝</span>
            Informasi Dasar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Nama Toko</label>
              <input type="text" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">No. Telepon / WhatsApp</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all" placeholder="08123456789" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Deskripsi / Slogan Singkat</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all min-h-[100px]" placeholder="Menyajikan kopi terbaik dari biji pilihan..."></textarea>
          </div>
        </div>

        {/* ── SECTION 3: SOCIAL MEDIA ── */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-black mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center text-lg">📱</span>
            Sosial Media & Kontak
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Instagram Username</label>
              <span className="absolute left-4 top-[38px] text-gray-400 font-bold">@</span>
              <input type="text" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl pl-9 pr-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all" placeholder="kofilo.id" />
            </div>
            <div className="space-y-2 relative">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">TikTok Username</label>
              <span className="absolute left-4 top-[38px] text-gray-400 font-bold">@</span>
              <input type="text" value={formData.tiktok} onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl pl-9 pr-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all" placeholder="kofilo.coffee" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Email Bisnis</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all" placeholder="hello@kofilo.com" />
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={submitting}
            className="bg-[#1a1f36] text-white px-10 py-4 rounded-2xl font-extrabold text-[15px] shadow-[0_8px_20px_-6px_rgba(26,31,54,0.3)] hover:bg-[#2a314d] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:translate-y-0">
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>

      {/* ── TOAST NOTIFICATION ── */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`rounded-[20px] p-4 pr-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border flex items-center gap-4 min-w-[300px] bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toast.type === "success" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
              {toast.type === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <p className="text-[14px] font-bold text-[#1a1f36] flex-1">{toast.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}