'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { use } from 'react';
export default function CustomerCartPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const { cart, updateQuantity, removeFromCart } = useCartStore();

  // Perhitungan Harga
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAndService = subtotal * 0.10; // Asumsi pajak & layanan 10%
  const total = subtotal + taxAndService;

  // Fungsi untuk menangani pengurangan jumlah item
  const handleDecrease = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1);
    } else {
      removeFromCart(id); // Jika jumlah 1 dikurangi lagi, hapus dari keranjang
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col">
      
      {/* HEADER */}
      <header className="bg-white px-6 py-5 border-b border-gray-100 sticky top-0 z-10 flex items-center gap-4 shadow-sm">
        <Link href={`/${tableId}/menu`} className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="font-extrabold text-xl text-[#1a1f36] leading-tight">Current Order</h1>
          <p className="text-sm text-gray-500 font-medium">Table {tableId} • Dine In</p>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col">
        {cart.length === 0 ? (
          // TAMPILAN JIKA KERANJANG KOSONG
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 mt-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Cart is empty</p>
          </div>
        ) : (
          // DAFTAR ITEM DI KERANJANG
          <div className="flex flex-col gap-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-[#1a1f36] text-[15px] leading-tight mb-1">{item.name}</h3>
                  {item.variants && (
                    <p className="text-xs text-gray-500 mb-2 font-medium">{item.variants}</p>
                  )}
                  <p className="text-[#7a5c43] font-extrabold text-sm mt-1">
                    Rp {item.price.toLocaleString('id-ID')}
                  </p>
                </div>
                
                {/* Kontrol Kuantitas */}
                <div className="flex items-center gap-3 bg-[#f8f9fa] border border-gray-200 rounded-full px-3 py-1.5">
                  <button 
                    onClick={() => handleDecrease(item.id, item.quantity)}
                    className="text-gray-500 hover:text-black font-bold text-lg w-6 h-6 flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="font-extrabold text-[#1a1f36] text-sm w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-gray-500 hover:text-black font-bold text-lg w-6 h-6 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* RINGKASAN & TOMBOL CHECKOUT (Hanya muncul jika ada isi) */}
      {cart.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] rounded-t-3xl mt-auto z-20">
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Tax & Service (10%)</span>
              <span>Rp {taxAndService.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 my-1"></div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-extrabold text-[#1a1f36]">Total</span>
              <span className="text-xl font-extrabold text-[#1a1f36]">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Tombol Proceed to Checkout */}
          <Link href={`/${tableId}/checkout`} className="block w-full bg-[#e8e2d9] text-[#7a5c43] text-center py-4 rounded-xl font-bold text-[15px] hover:bg-[#d8cfc0] active:scale-95 transition-all">
            Proceed to Checkout
          </Link>
        </div>
      )}
    </div>
  );
}