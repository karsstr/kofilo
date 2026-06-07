'use client';

import { use } from 'react';
import Link from 'next/link';

export default function CustomerWelcomePage({ params }: { params: Promise<{ tableId: string }> }) {
  // Karena ini Next.js 15+, kita buka bungkus params-nya pakai 'use'
  const { tableId } = use(params);

  return (
    <div className="min-h-screen bg-[#7a5c43] flex flex-col items-center justify-center text-white p-6">
      
      {/* Icon atau Logo Toko */}
      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-fade-in-up">
        <span className="text-5xl">☕</span>
      </div>
      
      {/* Teks Sambutan */}
      <h1 className="text-3xl font-extrabold mb-2 text-center">Craft Coffee</h1>
      <p className="text-white/80 mb-12 text-center font-medium">
        Welcome to Table {tableId}
      </p>
      
      {/* Tombol Menuju Menu */}
      <Link 
        href={`/${tableId}/menu`}
        className="bg-white text-[#7a5c43] w-full max-w-xs text-center py-4 rounded-full font-extrabold text-[15px] shadow-xl hover:bg-gray-50 active:scale-95 transition-all"
      >
        View Menu & Order
      </Link>

    </div>
  );
}