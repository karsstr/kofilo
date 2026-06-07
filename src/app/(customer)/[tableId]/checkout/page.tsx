'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';

export default function CustomerCheckoutPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const router = useRouter();
  const { cart, clearCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Jika keranjang kosong, kembalikan ke halaman menu
  useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      router.push(`/${tableId}/menu`);
    }
  }, [cart.length, router, tableId, isProcessing]);

  // Perhitungan Harga
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAndService = subtotal * 0.10;
  const total = subtotal + taxAndService;

  // Tanggal & Waktu untuk setruk
  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const formattedTime = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const txNumber = `TX${Math.floor(Math.random() * 100000000)}`;

  const handleConfirmPayment = () => {
    if (!paymentMethod) return;
    
    setIsProcessing(true);

    // Simulasi proses loading ke database
    setTimeout(() => {
      alert(`Pesanan Meja ${tableId} Berhasil Dibuat!\nMetode: ${paymentMethod}`);
      clearCart();
      router.push(`/${tableId}/menu`); // Nanti bisa diganti ke halaman "Order Status"
    }, 1500);
  };

  if (cart.length === 0 && !isProcessing) return null; // Cegah render jika kosong

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#1a1f36] flex flex-col pb-24">
      
      {/* HEADER */}
      <header className="bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href={`/${tableId}/cart`} className="text-gray-500 hover:text-black transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="font-extrabold text-xl leading-tight">Payment</h1>
        </div>
      </header>

      <main className="p-6 flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
        
        {/* DESAIN SETRUK (RECEIPT) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
          <div className="text-center mb-6">
            <h2 className="font-extrabold text-lg tracking-wide">CRAFT COFFEE</h2>
            <p className="text-xs text-gray-500 mt-1">Jl. Senopati No. 42, Jakarta<br/>Tel: (021) 555-0123</p>
          </div>

          <div className="border-t border-dashed border-gray-300 py-3 flex justify-between text-[11px] text-gray-500 font-medium">
            <div>
              <p>Date: {formattedDate}</p>
              <p>Time: {formattedTime}</p>
            </div>
            <div className="text-right">
              <p>TX: {txNumber}</p>
              <p>Table: {tableId}</p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 py-4 flex flex-col gap-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-bold text-[#1a1f36]">{item.quantity}x {item.name}</p>
                  {item.variants && (
                    <div className="text-[11px] text-gray-500 mt-0.5 ml-4">
                      {item.variants.split(', ').map((v, i) => <p key={i}>- {v}</p>)}
                    </div>
                  )}
                </div>
                <p className="font-bold text-[#1a1f36]">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 py-4 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Tax (10%)</span>
              <span>Rp {taxAndService.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-extrabold text-base">TOTAL</span>
              <span className="font-extrabold text-base">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* PILIHAN METODE PEMBAYARAN */}
        <div>
          <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Tombol Cash */}
            <button 
              onClick={() => setPaymentMethod('CASH')}
              className={`py-5 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                paymentMethod === 'CASH' 
                ? 'border-[#7a5c43] bg-[#7a5c43]/5 text-[#7a5c43]' 
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V4.242c0-.754-.727-1.294-1.453-1.096a60.07 60.07 0 01-15.797 2.101c-.727.198-1.453.342-1.453 1.096V18.75z" />
              </svg>
              <span className="font-bold text-sm">Pay at Cashier</span>
            </button>

            {/* Tombol QRIS */}
            <button 
              onClick={() => setPaymentMethod('QRIS')}
              className={`py-5 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                paymentMethod === 'QRIS' 
                ? 'border-[#7a5c43] bg-[#7a5c43]/5 text-[#7a5c43]' 
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
              <span className="font-bold text-sm">QRIS / E-Wallet</span>
            </button>
          </div>
        </div>

      </main>

      {/* FIXED BOTTOM BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-20">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleConfirmPayment}
            disabled={!paymentMethod || isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-[15px] transition-all flex justify-center items-center gap-2 ${
              isProcessing ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
              paymentMethod 
                ? 'bg-[#7a5c43] text-white shadow-md hover:bg-[#634832] active:scale-95' 
                : 'bg-[#e8e2d9] text-white cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Processing...' : `Confirm Payment - Rp ${total.toLocaleString('id-ID')}`}
          </button>
        </div>
      </div>

    </div>
  );
}