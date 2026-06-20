'use client';

import { useState } from 'react';
import { usePwaAuthStore } from '@/store/usePwaAuthStore';

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  context?: 'checkout' | 'loyalty';
}

export default function AuthDrawer({ isOpen, onClose, onSuccess, context = 'checkout' }: AuthDrawerProps) {
  const { setCustomer } = usePwaAuthStore();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name.trim()) {
      setError('Nama lengkap wajib diisi.');
      setIsLoading(false);
      return;
    }

    if (phone.length < 10) {
      setError('Nomor HP tidak valid.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/pwa/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Gagal login. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      setCustomer({
        id: data.customer.id,
        name: data.customer.name,
        phone: data.customer.phone,
        points: data.customer.points,
        token: data.token,
      });

      // Simpan penanda bahwa barusan login (berguna untuk PWA UI notifikasi)
      sessionStorage.setItem("justLoggedIn", "true");

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError('Koneksi terputus. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 relative z-10 animate-in slide-in-from-bottom-full duration-300">
        
        {/* Handle Garis (Visual) */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

        <div className="text-center mb-6">
          <h2 className="font-extrabold text-xl text-gray-900 mb-1">
            {context === 'checkout' ? 'Detail Pemesan' : 'Daftar Kofilo Loyalty'}
          </h2>
          <p className="text-sm text-gray-500">
            {context === 'checkout' ? 'Silakan lengkapi data berikut untuk proses checkout dan pencetakan setruk.' : 'Masuk untuk mulai mengumpulkan poin dan menukarnya dengan kopi gratis!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-extrabold text-gray-700 ml-1">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cth: Alex Morgan"
              className="bg-gray-50 border border-gray-200 text-gray-900 text-[15px] font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#7a5c43]/40 focus:ring-4 focus:ring-[#7a5c43]/10 transition-all placeholder-gray-400"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-extrabold text-gray-700 ml-1">Nomor WhatsApp</label>
            <div className="flex border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 focus-within:border-[#7a5c43]/40 focus-within:ring-4 focus-within:ring-[#7a5c43]/10 transition-all">
              <span className="flex items-center px-4 bg-gray-100/50 text-gray-500 font-extrabold text-[15px] border-r border-gray-200">
                +62
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Hanya terima angka
                placeholder="81234567890"
                className="w-full bg-transparent text-gray-900 text-[15px] font-bold px-4 py-4 focus:outline-none placeholder-gray-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center transition-all ${
              isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#7a5c43] text-white hover:bg-[#634832] active:scale-[0.98]'
            }`}
          >
            {isLoading ? 'Memproses...' : 'Lanjut'}
          </button>
        </form>
      </div>
    </div>
  );
}