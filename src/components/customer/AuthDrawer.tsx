'use client';

// =============================================================
// Component: AuthDrawer
// Bottom drawer untuk input nomor HP (login PWA customer)
// Muncul saat guest mencoba checkout ATAU klik Kofilo Loyalty
// =============================================================

import { useState } from 'react';
import { usePwaAuthStore } from '@/store/usePwaAuthStore';

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  context?: 'checkout' | 'loyalty'; // Menentukan dari mana ini dipanggil
}

export default function AuthDrawer({ isOpen, onClose, onSuccess, context = 'checkout' }: AuthDrawerProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setCustomer } = usePwaAuthStore();

  const isValid = phone.replace(/\D/g, '').length >= 10 && phone.replace(/\D/g, '').length <= 13;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/pwa/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, '') }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login gagal');
        return;
      }

      setCustomer({ ...data.customer, token: data.token });
      setPhone('');
      onClose();
      onSuccess?.();
    } catch {
      setError('Koneksi gagal, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Menyesuaikan copywriting berdasarkan konteks pemanggilan
  const title = context === 'checkout' ? 'Masuk untuk Checkout' : 'Kofilo Loyalty';
  const description = context === 'checkout' 
    ? 'Masukkan nomor HP untuk melanjutkan pesanan dan kumpulkan poin loyalty.' 
    : 'Masukkan nomor HP untuk masuk atau daftar Kofilo Loyalty dan mulai kumpulkan poin!';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom max-w-lg mx-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

        <h2 className="text-xl font-extrabold text-[#1a1f36] mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{description}</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-medium rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#A67B5B] focus-within:ring-2 focus-within:ring-[#A67B5B]/20 transition-all mb-2">
          <span className="px-4 py-4 bg-gray-50 border-r border-gray-200 text-[#1a1f36] font-bold text-sm select-none">+62</span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="8xx-xxxx-xxxx"
            className="flex-1 px-4 py-4 text-sm font-medium focus:outline-none text-[#1a1f36]"
            maxLength={13}
          />
        </div>
        <p className="text-xs text-gray-400 mb-6">Format: 10-13 digit tanpa awalan 0 atau +62</p>

        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md ${
            isValid && !loading
              ? 'bg-[#1C1917] text-white hover:bg-black active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          {loading ? 'Memproses...' : 'Masuk / Daftar Otomatis'}
        </button>
      </div>
    </>
  );
}