"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function KofiloLandingPage() {
  const [scrolled, setScrolled] = useState(false);

  // Efek transparan pada Navbar saat di-scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#1a1f36] font-sans selection:bg-[#6C4E31] selection:text-white overflow-hidden">
      
      {/* ── NAVBAR (Glassmorphism) ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center relative h-10">
          
          {/* Logo (Kiri) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C4E31] to-[#583f27] flex items-center justify-center text-white text-lg shadow-lg relative">
              <span className="font-black tracking-tighter">K</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 rounded-xl"></div>
            </div>
            <span className="font-black text-[20px] tracking-tight">Kofilo.</span>
          </div>
          
          {/* Menu Navigasi (Tepat di Tengah Layar) */}
          <div className="hidden md:flex items-center gap-8 text-[14px] font-bold text-gray-500 absolute left-1/2 -translate-x-1/2">
            <a href="#fitur" className="hover:text-[#6C4E31] transition-colors">Fitur</a>
            <a href="#solusi" className="hover:text-[#6C4E31] transition-colors">Solusi</a>
            <a href="#testimoni" className="hover:text-[#6C4E31] transition-colors">Testimoni</a>
            <a href="#harga" className="hover:text-[#6C4E31] transition-colors">Harga</a>
          </div>

        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-[#6C4E31]/10 to-transparent blur-3xl -z-10 rounded-full"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6C4E31]/10 border border-[#6C4E31]/20 text-[#6C4E31] text-[12px] font-extrabold tracking-widest uppercase mb-6 animate-in slide-in-from-bottom-4 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6C4E31] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6C4E31]"></span>
          </span>
          Kofilo v2.0 Telah Rilis
        </div>

        <h1 className="text-[40px] md:text-[64px] font-black tracking-tighter leading-[1.1] mb-6 max-w-4xl mx-auto animate-in slide-in-from-bottom-5 duration-700">
          Tinggalkan Kasir Jadul.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4E31] to-[#b38150]">
            Ubah Pengunjung Jadi Pelanggan Setia.
          </span>
        </h1>

        <p className="text-[16px] md:text-[20px] text-gray-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed animate-in slide-in-from-bottom-6 duration-700 delay-100">
          Platform All-in-One untuk bisnis F&B modern. Dilengkapi sistem pemesanan via PWA, Manajemen CMS *real-time*, hingga Program Loyalty otomatis dalam satu ekosistem.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <Link href="/cms/dashboard" className="w-full sm:w-auto bg-[#6C4E31] text-white px-8 py-4 rounded-2xl text-[16px] font-black shadow-[0_8px_20px_-6px_rgba(108,78,49,0.5)] hover:bg-[#583f27] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            Mulai Transformasi Kafe Anda
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
          <button className="w-full sm:w-auto bg-white border border-gray-200 text-[#1a1f36] px-8 py-4 rounded-2xl text-[16px] font-extrabold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
            Tonton Demo 2 Menit
          </button>
        </div>

        {/* Abstrak UI Dashboard Mockup */}
        <div className="mt-20 w-full max-w-5xl relative animate-in zoom-in-95 duration-1000 delay-300">
          <div className="absolute inset-0 bg-gradient-to-t from-[#fafbfc] via-transparent to-transparent z-10"></div>
          <div className="bg-white border border-gray-200/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-t-[32px] md:rounded-t-[40px] p-4 md:p-6 pb-0 overflow-hidden h-[300px] md:h-[500px]">
            {/* Header Mockup */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="bg-gray-100 rounded-lg px-20 py-2"></div>
              <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
            </div>
            {/* Body Mockup */}
            <div className="grid grid-cols-12 gap-6 h-full">
              <div className="col-span-3 hidden md:block bg-gray-50 rounded-2xl h-full border border-gray-100 p-4 space-y-4">
                <div className="w-full h-8 bg-gray-200 rounded-lg mb-8"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="col-span-12 md:col-span-9 bg-gray-50 rounded-2xl h-full border border-gray-100 p-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 h-24 bg-white border border-gray-100 rounded-xl shadow-sm"></div>
                  <div className="flex-1 h-24 bg-white border border-gray-100 rounded-xl shadow-sm"></div>
                  <div className="flex-1 h-24 bg-white border border-gray-100 rounded-xl shadow-sm"></div>
                </div>
                <div className="w-full h-48 bg-white border border-gray-100 rounded-xl shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO CLOUD (Social Proof) ── */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[13px] font-extrabold text-gray-400 uppercase tracking-widest mb-6">Dipercaya oleh Coffee Shop & Resto Berkembang</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
            <h2 className="text-xl font-black">Azalia Coffee</h2>
            <h2 className="text-xl font-black font-serif italic">Els Koffie</h2>
            <h2 className="text-xl font-black tracking-widest">BREW & BAKE</h2>
            <h2 className="text-xl font-black font-mono">/KopiLokal</h2>
            <h2 className="text-xl font-black">DailyRoast.</h2>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID FEATURES ── */}
      <section id="fitur" className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-[32px] md:text-[40px] font-black tracking-tight mb-4 text-[#1a1f36]">Bukan Sekadar Aplikasi Kasir.</h2>
          <p className="text-gray-500 font-medium text-[16px]">Kofilo dirancang khusus untuk memanjakan pelanggan Anda sekaligus memberikan kontrol penuh di genggaman Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: PWA Ordering */}
          <div className="md:col-span-2 bg-[#1a1f36] rounded-[32px] p-10 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
              </div>
              <h3 className="text-[24px] font-black text-white mb-3 tracking-tight">Self-Order via PWA</h3>
              <p className="text-gray-400 font-medium max-w-md">Pelanggan scan QR di meja, pesan menu, dan bayar tanpa perlu antre di kasir. Tanpa download aplikasi!</p>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-gradient-to-tl from-[#6C4E31] to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
          </div>

          {/* Card 2: Loyalty Hub */}
          <div className="bg-[#6C4E31] rounded-[32px] p-10 relative overflow-hidden group text-white">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-[24px] font-black mb-3 tracking-tight">Loyalty Hub Otomatis</h3>
              <p className="text-white/80 font-medium">Setiap transaksi jadi poin. Pelanggan kembali lagi untuk tukar poin dengan menu favorit.</p>
            </div>
          </div>

          {/* Card 3: Live Settings */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-[32px] p-10 group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all">
            <div className="w-12 h-12 bg-gray-100 text-[#1a1f36] rounded-2xl flex items-center justify-center mb-6 border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="text-[20px] font-black text-[#1a1f36] mb-3 tracking-tight">Kendalikan Secara Live</h3>
            <p className="text-gray-500 font-medium">Pajak, Service Charge, Stok Kosong, hingga Jam Buka. Atur via CMS dan PWA akan langsung update.</p>
          </div>

          {/* Card 4: Receipt Config */}
          <div className="md:col-span-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200 shadow-sm rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all">
            <div className="max-w-sm mb-6 md:mb-0">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <h3 className="text-[24px] font-black text-[#1a1f36] mb-3 tracking-tight">Kustomisasi Struk Thermal</h3>
              <p className="text-gray-500 font-medium">Beri sentuhan personal. Tambahkan password WiFi atau ucapan terima kasih di struk Anda dengan *Live Preview*.</p>
            </div>
            <div className="w-48 bg-white border border-gray-200 shadow-lg p-4 rotate-3 group-hover:rotate-0 transition-transform duration-500 relative">
              <div className="border-b-2 border-dashed border-gray-300 pb-2 mb-2 text-center">
                <h4 className="font-black text-[14px]">KOFILO</h4>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-2"><span>1x Latte</span><span>28K</span></div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-2"><span>1x Toast</span><span>25K</span></div>
              <div className="border-t-2 border-dashed border-gray-300 pt-2 mt-2 text-[10px] text-center font-bold text-gray-400">Wi-Fi: CafeKofilo<br/>Pass: 12345678</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── TESTIMONIAL / CALL TO ACTION ── */}
      <section id="testimoni" className="relative py-24 bg-[#1a1f36] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6C4E31] blur-[150px] opacity-30 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16 mx-auto text-[#6C4E31] mb-8 opacity-50"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
          <h2 className="text-[28px] md:text-[36px] font-medium leading-tight mb-8">
            "Sejak pakai Kofilo, operasional jauh lebih rapi. Pelanggan makin sering balik karena sistem poinnya gampang banget dipakai. Gak pusing lagi ngurus struk manual!"
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gray-500 rounded-full overflow-hidden border-2 border-[#6C4E31]">
              <img src="https://ui-avatars.com/api/?name=Faid+N&background=6C4E31&color=fff" alt="Owner" />
            </div>
            <div className="text-left">
              <p className="font-black">Faid Naziih</p>
              <p className="text-[12px] text-gray-400">Founder Els Koffie</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-[36px] md:text-[48px] font-black tracking-tighter text-[#1a1f36] mb-6">Siap Meroketkan Omset Kafe Anda?</h2>
        <p className="text-gray-500 font-medium max-w-xl mx-auto mb-10">Tinggalkan sistem lama yang ribet. Beralih ke Kofilo sekarang dan nikmati ekosistem bisnis F&B masa depan.</p>
        <Link href="/cms/dashboard" className="inline-flex items-center gap-2 bg-[#6C4E31] text-white px-10 py-5 rounded-2xl text-[18px] font-black shadow-[0_10px_30px_-10px_rgba(108,78,49,0.6)] hover:bg-[#583f27] hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(108,78,49,0.7)] transition-all">
          Buat Akun Kofilo Sekarang
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 bg-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C4E31] flex items-center justify-center text-white font-black">K</div>
            <span className="font-black text-[#1a1f36] text-[18px]">Kofilo.</span>
          </div>
          <div className="text-[14px] text-gray-500 font-medium">
            &copy; 2026 Kofilo Software. Hak Cipta Dilindungi.
          </div>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#6C4E31] hover:bg-[#6C4E31]/10 transition-colors">
              IG
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#6C4E31] hover:bg-[#6C4E31]/10 transition-colors">
              X
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}