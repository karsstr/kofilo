"use client";

import { useState, useEffect } from "react";

export default function OperationalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success" as "success" | "error", message: "" });

  const [formData, setFormData] = useState({
    address: "",
    mapsUrl: "",
    operatingHours: "",
    isStoreOpen: true,
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  useEffect(() => {
    const fetchOperational = async () => {
      try {
        const res = await fetch("/api/settings/operational");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setFormData({
              address: data.settings.address || "",
              mapsUrl: data.settings.mapsUrl || "",
              operatingHours: data.settings.operatingHours || "",
              isStoreOpen: data.settings.isStoreOpen ?? true,
            });
          }
        }
      } catch (error) {
        console.error("Gagal load operasional toko", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOperational();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/settings/operational", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      showToast("success", "Pengaturan operasional berhasil disimpan!");
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
        <p className="text-sm font-bold animate-pulse">Memuat Pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 lg:p-10 overflow-y-auto bg-[#fafbfc] text-[#1a1f36] font-sans">
      
      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-[28px] font-black tracking-tight text-[#1a1f36]">Location & Hours</h1>
        <p className="text-[15px] font-medium text-gray-500 mt-1">Atur alamat toko, jam buka, dan kontrol status toko (Buka/Tutup) secara real-time.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
        
        {/* ── SECTION 1: JAM OPERASIONAL & STATUS ── */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] font-black flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-lg">🕒</span>
              Jam & Status Toko
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Teks Jam Operasional</label>
              <input type="text" value={formData.operatingHours} onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all" 
                placeholder="Cth: Senin - Minggu, 08:00 - 22:00 WIB" />
              <p className="text-[11px] text-gray-400 mt-1 font-medium">Teks ini akan ditampilkan kepada pelanggan di halaman PWA.</p>
            </div>

            {/* TOGGLE STATUS TOKO */}
            <div className="flex flex-col gap-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Status Toko Saat Ini</label>
              <label className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-colors ${formData.isStoreOpen ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                <div>
                  <p className={`font-black text-[15px] ${formData.isStoreOpen ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formData.isStoreOpen ? 'Toko Sedang Buka' : 'Toko Sedang Tutup'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.isStoreOpen ? 'Pelanggan dapat membuat pesanan via PWA.' : 'Fitur pesanan di PWA dimatikan sementara.'}
                  </p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={formData.isStoreOpen}
                    onChange={(e) => setFormData({...formData, isStoreOpen: e.target.checked})}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isStoreOpen ? 'bg-emerald-500' : 'bg-rose-400'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isStoreOpen ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: LOKASI TOKO ── */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-black mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-lg">📍</span>
            Lokasi Toko
          </h2>

          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Alamat Lengkap</label>
              <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all min-h-[100px]" 
                placeholder="Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan..."></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">Link Google Maps</label>
              <input type="url" value={formData.mapsUrl} onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-200 text-[#1a1f36] font-bold rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#6C4E31]/10 focus:border-[#6C4E31]/40 transition-all" 
                placeholder="https://maps.google.com/..." />
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