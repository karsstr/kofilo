"use client";
import { useState, useEffect } from "react";

interface Banner {
  id: string;
  image: string; // Base64 string
  isActive: boolean;
}

export default function PwaSettingsPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/pwa")
      .then(res => res.json())
      .then(data => {
        if (data.settings) setBanners(data.settings.pwaBanners || []);
        setLoading(false);
      });
  }, []);

  // 🔥 FUNGSI HANDLE UPLOAD (Convert ke Base64)
  const handleFileUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setBanners(banners.map(b => b.id === id ? { ...b, image: reader.result as string } : b));
    };
    reader.readAsDataURL(file);
  };

  const addBanner = () => {
    setBanners([...banners, { id: Date.now().toString(), image: "", isActive: true }]);
  };

  const removeBanner = (id: string) => setBanners(banners.filter(b => b.id !== id));

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/pwa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pwaBanners: banners })
      });
      if (res.ok) alert("Banner berhasil disimpan!");
    } catch {
      alert("Gagal menyimpan.");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Memuat...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-[28px] font-black text-[#1a1f36]">Promo Banner Config</h1>
        <button onClick={saveSettings} disabled={saving} className="bg-[#1a1f36] text-white px-6 py-3 rounded-xl font-bold">{saving ? "Menyimpan..." : "Simpan"}</button>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm space-y-6">
        {banners.map((banner, index) => (
          <div key={banner.id} className="border-2 border-gray-100 rounded-2xl p-4 flex items-center gap-4">
            <span className="font-black text-gray-400">#{index + 1}</span>
            
            {/* 🔥 INPUT FILE */}
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(banner.id, e.target.files[0])}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#6C4E31]/10 file:text-[#6C4E31] hover:file:bg-[#6C4E31]/20"
            />
            
            {/* Preview */}
            {banner.image && <img src={banner.image} className="w-12 h-12 rounded-lg object-cover" />}

            <input type="checkbox" checked={banner.isActive} onChange={(e) => setBanners(banners.map(b => b.id === banner.id ? {...b, isActive: e.target.checked} : b))} className="w-5 h-5 accent-[#6C4E31]" />
            <button onClick={() => removeBanner(banner.id)} className="text-red-500 font-bold px-2">✕</button>
          </div>
        ))}
        <button onClick={addBanner} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-[#6C4E31] hover:text-[#6C4E31] transition-all">+ Tambah Banner</button>
      </div>
    </div>
  );
}