"use client";

import { useState, useEffect } from "react";

interface Banner {
  id: string;
  image: string; // Base64 string
  isActive: boolean;
}

export default function PwaSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success" as "success" | "error", message: "" });

  const [banners, setBanners] = useState<Banner[]>([]);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  
  // State Halaman Penyambut
  const [welcomeBg, setWelcomeBg] = useState("");
  const [welcomeSubtitle, setWelcomeSubtitle] = useState("TABLE DASHBOARD");
  const [footerText, setFooterText] = useState("© 2026 KOFILO. PREMIUM EXPERIENCE.");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  useEffect(() => {
    const fetchPwaSettings = async () => {
      try {
        const res = await fetch("/api/settings/pwa");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setBanners(data.settings.pwaBanners || []);
            setIsStoreOpen(data.settings.isStoreOpen ?? true);
            setWelcomeBg(data.settings.pwaWelcomeBg || "");
            setWelcomeSubtitle(data.settings.pwaWelcomeSubtitle || "TABLE DASHBOARD");
            setFooterText(data.settings.pwaFooterText || "© 2026 KOFILO. PREMIUM EXPERIENCE.");
          }
        }
      } catch (error) {
        console.error("Gagal load pengaturan PWA", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPwaSettings();
  }, []);

  const handleBannerUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setBanners(banners.map(b => b.id === id ? { ...b, image: reader.result as string } : b));
    };
    reader.readAsDataURL(file);
  };

  const handleBgUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setWelcomeBg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addBanner = () => setBanners([...banners, { id: Date.now().toString(), image: "", isActive: true }]);
  const removeBanner = (id: string) => setBanners(banners.filter(b => b.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        isStoreOpen,
        pwaBanners: banners,
        pwaWelcomeBg: welcomeBg,
        pwaWelcomeSubtitle: welcomeSubtitle,
        pwaFooterText: footerText
      };

      const res = await fetch("/api/settings/pwa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      showToast("success", "Pengaturan PWA berhasil disimpan!");
    } catch (error: any) {
      showToast("error", error.message || "Gagal menyimpan konfigurasi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-10 flex flex-col items-center justify-center text-[#6C4E31] gap-4 h-full">
        <div className="w-8 h-8 border-4 border-[#6C4E31] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold animate-pulse">Memuat Pengaturan PWA...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 lg:p-10 overflow-y-auto bg-[#fafbfc] text-[#1a1f36] font-sans">
      
      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-[28px] font-black tracking-tight text-[#1a1f36]">PWA App Config</h1>
        <p className="text-[15px] font-medium text-gray-500 mt-1">Atur tampilan promo carousel dan layanan di aplikasi pelanggan.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
        
        {/* 1. KONTROL OPERASIONAL TOKO */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-black mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-lg">🏪</span>
            Status Operasional Toko
          </h2>
          
          <div className="flex justify-between items-center bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <div>
              <h3 className="text-[15px] font-black text-[#1a1f36]">Terima Pesanan PWA</h3>
              <p className="text-gray-500 text-[13px] mt-1 max-w-md">Jika dimatikan, pelanggan tidak bisa menekan tombol checkout di PWA dan akan mendapat notifikasi bahwa toko sedang sibuk/tutup.</p>
            </div>
            <button type="button" onClick={() => setIsStoreOpen(!isStoreOpen)} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${isStoreOpen ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isStoreOpen ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>
        </div>

        {/* 2. HALAMAN PENYAMBUT PWA */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-black mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-lg">📱</span>
            Halaman Penyambut (Welcome Screen)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Background Image (16:9)</label>
              <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                {welcomeBg ? (
                  <img src={welcomeBg} alt="Welcome BG" className="w-24 h-14 object-cover rounded-lg shadow-sm" />
                ) : (
                  <div className="w-24 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">No Image</div>
                )}
                <input 
                  type="file" accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleBgUpload(e.target.files[0])}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#6C4E31]/10 file:text-[#6C4E31] hover:file:bg-[#6C4E31]/20 cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Kata-kata Penyambut</label>
              <input type="text" value={welcomeSubtitle} onChange={(e) => setWelcomeSubtitle(e.target.value)} placeholder="Cth: TABLE DASHBOARD" className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Teks Copyright (Footer)</label>
              <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="© 2026 KOFILO. PREMIUM EXPERIENCE." className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all" />
            </div>
          </div>
        </div>

        {/* 3. BANNER CAROUSEL SETTING */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] font-black flex items-center gap-2">
              <span className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-lg">🎠</span>
              Promo Banner Carousel
            </h2>
            <button type="button" onClick={addBanner} className="text-[#6C4E31] font-bold text-[13px] bg-[#6C4E31]/10 px-4 py-2 rounded-xl hover:bg-[#6C4E31]/20 transition">+ Tambah Banner</button>
          </div>

          <div className="space-y-4">
            {banners.map((banner, index) => (
              <div key={banner.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 bg-gray-50/50">
                <span className="font-black text-gray-400 w-8 text-center">#{index + 1}</span>
                
                <div className="flex-1 w-full flex items-center gap-4">
                  {banner.image ? (
                    <img src={banner.image} className="w-16 h-10 rounded-lg object-cover shadow-sm bg-white" />
                  ) : (
                    <div className="w-16 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                  )}
                  <input 
                    type="file" accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleBannerUpload(banner.id, e.target.files[0])}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#6C4E31]/10 file:text-[#6C4E31] hover:file:bg-[#6C4E31]/20 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-200 pt-3 md:pt-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={banner.isActive} onChange={(e) => setBanners(banners.map(b => b.id === banner.id ? {...b, isActive: e.target.checked} : b))} className="w-5 h-5 accent-[#6C4E31]" />
                    <span className="text-[13px] font-bold text-[#1a1f36]">Aktif</span>
                  </label>
                  <button type="button" onClick={() => removeBanner(banner.id)} className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-medium">Belum ada banner promo.</p>
              </div>
            )}
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