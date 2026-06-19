'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePwaAuthStore } from '@/store/usePwaAuthStore';

// Interface Data Dummy (Nanti diganti jadi data dari Database)
interface RewardMenu {
  id: string;
  name: string;
  pointsRequired: number;
  image: string | null;
  description: string;
}

export default function RedeemLoyaltyPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const { customer, isLoggedIn } = usePwaAuthStore();
  
  // Karena saat ini saya belum tahu struktur Database Loyalty-mu, 
  // saya buatkan Data Dummy dulu agar UI-nya bisa langsung kamu test.
  const [rewards, setRewards] = useState<RewardMenu[]>([
    { id: '1', name: 'Free Americano', pointsRequired: 150, description: 'Segarnya Americano dingin gratis untukmu.', image: null },
    { id: '2', name: 'Artisan Latte', pointsRequired: 200, description: 'Nikmati Latte art cantik buatan barista kami.', image: null },
    { id: '3', name: 'Butter Croissant', pointsRequired: 250, description: 'Sempurna untuk teman ngopimu hari ini.', image: null },
  ]);

  const currentPoints = customer?.points || 0;

  const handleRedeem = (rewardName: string) => {
    // Nanti logika API ke Database taruh di sini
    alert(`Berhasil menukarkan poin dengan ${rewardName}! Silakan ambil di kasir.`);
  };

  if (!isLoggedIn()) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-[#1C1917] mb-2">Belum Login</h2>
        <p className="text-gray-500 mb-6">Silakan daftar atau login melalui halaman menu utama terlebih dahulu.</p>
        <Link href={`/${tableId}/menu`} className="bg-[#6C4E31] text-white px-6 py-3 rounded-full font-bold shadow-md">
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1C1917] selection:bg-[#A67B5B] selection:text-white pb-10">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md px-5 pt-6 pb-4 flex items-center gap-4 border-b border-gray-100">
        <Link href={`/${tableId}/menu`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-500 hover:text-[#1C1917] transition-colors">
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
          <div className="w-14 h-14 bg-[#1C1917]/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm border border-white/10 relative z-10">
            🎁
          </div>
        </div>

        {/* ── DAFTAR REWARD ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-[0.1em]">Menu Spesial Loyalty</h3>
            <div className="h-[1px] flex-1 bg-gray-200"></div>
          </div>

          {rewards.map((reward) => {
            const isEnoughPoints = currentPoints >= reward.pointsRequired;
            const diffPoints = reward.pointsRequired - currentPoints;

            return (
              <div key={reward.id} className="bg-white rounded-[20px] p-4 flex gap-4 overflow-hidden shadow-sm border border-gray-100 transition-all duration-300">
                {/* Gambar Thumbnail */}
                <div className={`w-[85px] h-[85px] rounded-[14px] bg-gray-50 flex-shrink-0 relative overflow-hidden flex items-center justify-center text-3xl transition-all ${!isEnoughPoints ? 'grayscale-[60%] opacity-80' : ''}`}>
                  {reward.image ? <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" /> : '☕'}
                </div>

                {/* Konten Kanan */}
                <div className="flex flex-col justify-center flex-1">
                  <h3 className="text-[16px] font-extrabold text-[#1C1917] leading-tight mb-1">{reward.name}</h3>
                  <p className="text-[12px] text-gray-400 font-medium leading-snug line-clamp-2 mb-3">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    {/* Badge Poin (Warna Berubah) */}
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black tracking-widest uppercase transition-colors ${
                      isEnoughPoints 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {reward.pointsRequired} Pts
                    </span>

                    {/* Tombol atau Keterangan Kekurangan */}
                    {isEnoughPoints ? (
                      <button onClick={() => handleRedeem(reward.name)} className="bg-[#A67B5B] hover:bg-[#8e684d] text-white px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-colors active:scale-95">
                        Tukarkan
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-400 bg-rose-50 px-3 py-1 rounded-full">
                        {diffPoints} poin lagi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}