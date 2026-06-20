'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePwaAuthStore } from '@/store/usePwaAuthStore';

// Interface disesuaikan dengan skema tabel RewardProduct
interface RewardMenu {
  id: string;
  name: string;
  code: string;
  pointCost: number;
}

export default function RedeemLoyaltyPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const { customer, isLoggedIn } = usePwaAuthStore();
  
  const [rewards, setRewards] = useState<RewardMenu[]>([]);
  const [loading, setLoading] = useState(true);

  const currentPoints = customer?.points || 0;

  // ── PENGAMBILAN DATA REWARD (DENGAN AUTO-UPDATE) ──
  useEffect(() => {
    let isMounted = true;

    const fetchRewards = async () => {
      try {
        const res = await fetch('/api/v1/pwa/rewards');
        if (!res.ok) return;

        const data = await res.json();
        
        // Hanya update state jika komponen masih aktif
        if (isMounted) {
          setRewards(data.rewards ?? []);
        }
      } catch (err) {
        console.error("Gagal mengambil data reward:", err);
      } finally {
        // Matikan loading skeleton setelah fetch pertama selesai
        if (isMounted) setLoading(false);
      }
    };

    if (isLoggedIn()) {
      // 1. Fetch data saat halaman pertama kali dibuka
      fetchRewards();

      // 2. Set Polling (Auto-update) setiap 10 detik (10000 ms)
      const intervalId = setInterval(() => {
        fetchRewards();
      }, 10000);

      // 3. Bersihkan interval saat user pindah halaman agar memori tidak bocor
      return () => { 
        isMounted = false; 
        clearInterval(intervalId); 
      };
    } else {
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [isLoggedIn]);

  const handleRedeem = (rewardName: string, pointCost: number) => {
    // TODO: Integrasikan dengan endpoint penukaran poin nantinya
    alert(`Berhasil! Poin kamu dipotong ${pointCost} Pts untuk menukar ${rewardName}. Silakan ambil di kasir.`);
  };

  if (!isLoggedIn()) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-[#1C1917] mb-2">Belum Login</h2>
        <p className="text-gray-500 mb-6">Silakan daftar atau login melalui halaman menu utama terlebih dahulu.</p>
        <Link href={`/${tableId}/menu`} className="bg-[#6C4E31] text-white px-6 py-3 rounded-full font-bold shadow-md active:scale-95 transition-transform">
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1C1917] selection:bg-[#A67B5B] selection:text-white pb-10">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7] px-5 pt-6 pb-4 flex items-center gap-4 border-b border-gray-100">
        <Link href={`/${tableId}/menu`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-500 hover:text-[#1C1917] transition-colors active:scale-90">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </Link>
        <h1 className="font-black text-[20px] tracking-tight text-[#1C1917]">Redeem Point</h1>
      </header>

      <main className="p-5 max-w-2xl mx-auto flex flex-col gap-8">
        
        {/* ── INFO POINT ── */}
        <div className="bg-gradient-to-br from-[#6C4E31] to-[#4A3B32] rounded-[24px] p-6 shadow-lg relative overflow-hidden flex items-center justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <p className="text-white/80 font-bold text-[12px] uppercase tracking-widest mb-1">Poin Tersedia</p>
            <h2 className="text-white font-black text-[36px] leading-none">{currentPoints} <span className="text-[16px] text-[#E3C39D] font-bold tracking-normal">Pts</span></h2>
          </div>
          <div className="w-14 h-14 bg-[#1C1917]/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm border border-white/10 relative z-10 shadow-inner">
            🎁
          </div>
        </div>

        {/* ── DAFTAR REWARD ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-1">
              <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-[0.1em] whitespace-nowrap">Menu Spesial Loyalty</h3>
              <div className="h-[1px] flex-1 bg-gray-200"></div>
            </div>
          </div>

          {loading ? (
            // Skeleton Loading UI
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="bg-white rounded-[20px] p-4 flex gap-4 border border-gray-100 animate-pulse">
                  <div className="w-[85px] h-[85px] rounded-[14px] bg-gray-100 flex-shrink-0"></div>
                  <div className="flex flex-col flex-1 py-1">
                    <div className="w-3/4 h-5 bg-gray-100 rounded-md mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-50 rounded-md mb-4"></div>
                    <div className="flex justify-between mt-auto">
                      <div className="w-16 h-6 bg-gray-100 rounded-md"></div>
                      <div className="w-20 h-6 bg-gray-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : rewards.length === 0 ? (
            // State Kosong
            <div className="text-center py-12 bg-white rounded-[20px] border border-gray-100">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-gray-400 font-bold text-sm">Belum ada menu reward yang tersedia.</p>
            </div>
          ) : (
            // Daftar Reward Aktual
            rewards.map((reward) => {
              const isEnoughPoints = currentPoints >= reward.pointCost;
              const diffPoints = reward.pointCost - currentPoints;

              return (
                <div key={reward.id} className="bg-white rounded-[20px] p-4 flex gap-4 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-transparent hover:border-gray-100 transition-all duration-300">
                  {/* Gambar Thumbnail (Fallback Generik) */}
                  <div className={`w-[85px] h-[85px] rounded-[14px] bg-gray-50 border border-gray-100 flex-shrink-0 relative overflow-hidden flex items-center justify-center text-3xl transition-all ${!isEnoughPoints ? 'grayscale-[60%] opacity-70' : ''}`}>
                    ☕
                  </div>

                  {/* Konten Kanan */}
                  <div className="flex flex-col justify-center flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[16px] font-extrabold text-[#1C1917] leading-tight pr-2">{reward.name}</h3>
                    </div>
                    {/* Menggunakan kode reward sebagai pemanis deskripsi karena deskripsi asli tidak ada di schema */}
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-snug mb-3">Kode: {reward.code}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      {/* Badge Poin */}
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-black tracking-widest uppercase transition-colors ${
                        isEnoughPoints 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {reward.pointCost} Pts
                      </span>

                      {/* Tombol Aksi */}
                      {isEnoughPoints ? (
                        <button 
                          onClick={() => handleRedeem(reward.name, reward.pointCost)} 
                          className="bg-[#A67B5B] hover:bg-[#8e684d] text-white px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-colors active:scale-95"
                        >
                          Tukarkan
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-400 bg-rose-50 border border-rose-100/50 px-3 py-1 rounded-full whitespace-nowrap">
                          {diffPoints} poin lagi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}