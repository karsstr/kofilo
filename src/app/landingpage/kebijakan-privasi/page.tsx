"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const sections = [
  { id: "perolehan", title: "Perolehan Data" },
  { id: "penggunaan", title: "Penggunaan Data" },
  { id: "keamanan", title: "Jaminan Keamanan Data" },
];

export default function PrivacyPolicy() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [scrolled, setScrolled] = useState(false);
  const [storeInfo, setStoreInfo] = useState({ name: "Kafiloo", logo: "" });

  useEffect(() => {
    fetch("/api/public/store")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setStoreInfo({
            name: data.settings.storeName || "Kafiloo",
            logo: data.settings.logo || "",
          });
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const scrollPosition = window.scrollY + 180; 
      let current = sections[0].id;

      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          current = section.id;
        }
      });

      if (Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 20) {
        current = sections[sections.length - 1].id;
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  const storeInitial = storeInfo.name ? storeInfo.name.charAt(0).toUpperCase() : "K";

  return (
    // 🔥 PERBAIKAN: Hapus overflow-hidden/overflow-x-hidden dari sini 🔥
    <div className="min-h-screen bg-[#Fdfbf9] text-[#1a1f36] font-sans selection:bg-[#6C4E31] selection:text-white relative pb-20">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob { 0%, 100% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
        .animate-blob { animation: blob 15s infinite alternate; }
        .animate-blob-delayed { animation: blob 15s infinite alternate; animation-delay: 4s; }
        .bg-grid-pattern { background-image: radial-gradient(rgba(108, 78, 49, 0.15) 1px, transparent 1px); background-size: 40px 40px; }
      `}} />

      {/* 🔥 PERBAIKAN: Bungkus background animasi dalam div khusus yg overflow-hidden 🔥 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-60"></div>
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-orange-200/30 rounded-full blur-[150px] animate-blob mix-blend-multiply"></div>
        <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-[#6C4E31]/10 rounded-full blur-[150px] animate-blob-delayed mix-blend-multiply"></div>
      </div>

      <div className="fixed top-0 w-full z-50 p-4 transition-all duration-500 pointer-events-none">
        <nav className={`max-w-6xl mx-auto pointer-events-auto transition-all duration-500 rounded-full px-6 py-3 flex items-center justify-between ${scrolled ? "bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]" : "bg-transparent py-4"}`}>
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/landingpage')}>
            {storeInfo.logo ? (
              <img src={storeInfo.logo} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow-lg group-hover:scale-105 transition-all duration-300 bg-white" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#1a1f36] flex items-center justify-center text-white text-lg shadow-lg group-hover:scale-105 group-hover:bg-[#6C4E31] transition-all duration-300">
                <span className="font-black tracking-tighter">{storeInitial}</span>
              </div>
            )}
            <span className="font-black text-[22px] tracking-tight">{storeInfo.name}.</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => router.push('/landingpage')} className="px-4 py-2 text-[14px] font-bold text-gray-500 hover:text-[#1a1f36] hover:bg-gray-100/50 rounded-full transition-all duration-300">
              Kembali ke Beranda
            </button>
          </div>

          <div className="flex items-center gap-3">
             <Link href="/cms/dashboard" className="hidden md:block text-[14px] font-bold text-gray-600 hover:text-[#6C4E31] transition-colors">
              Login Owner
            </Link>
             <Link href="/cms/dashboard" className="bg-[#1a1f36] hover:bg-[#6C4E31] text-white px-6 py-2.5 rounded-full text-[14px] font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                Mulai Gratis
             </Link>
          </div>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-32 flex flex-col md:flex-row gap-8 relative z-10 items-start">
        
        {/* 🔥 SIDEBAR 🔥 */}
        <aside className="w-full md:w-1/4 h-fit sticky top-32">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] p-4 border border-white/50">
            <nav className="flex flex-col space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`text-left px-4 py-3.5 text-[14px] rounded-xl transition-all duration-300 font-medium ${
                    activeSection === sec.id
                      ? "bg-gray-50 text-[#1a1f36] border-l-[4px] border-[#6C4E31] shadow-sm font-bold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-[4px] border-transparent"
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── KONTEN UTAMA ── */}
        <main className="w-full md:w-3/4">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-white/50 p-8 md:p-14 mb-20">
            <h1 className="text-[36px] md:text-[42px] font-black text-[#1a1f36] tracking-tight mb-3">
              Kebijakan Privasi
            </h1>
            <p className="text-gray-500 text-[14px] font-semibold mb-10 pb-10 border-b border-gray-100">
              Terakhir Diperbarui: 16 Januari 2026
            </p>

            <div className="prose prose-gray max-w-none text-[15px] leading-[1.8] text-gray-600">
              <p className="mb-6">
                <strong>Kafiloo</strong> adalah pemilik konten, grafis, dan pengembang dari sistem POS 
                dan platform pemesanan Kafiloo. Kami berkomitmen penuh untuk melindungi dan menghargai privasi 
                data informasi pelanggan maupun data operasional perusahaan yang kami proses.
              </p>
              <p className="mb-10">
                Anda wajib membaca dan memahami Kebijakan Privasi kami sebelum menggunakan layanan Kafiloo. 
                Dengan mendaftar dan menggunakan layanan Kafiloo, kami menganggap Anda telah setuju dengan 
                Kebijakan Privasi ini.
              </p>

              <div id="perolehan" className="scroll-mt-40 mb-12">
                <h2 className="text-[20px] font-black text-[#1a1f36] mb-4 uppercase tracking-wide">1. Perolehan Data</h2>
                <p className="mb-2">Kafiloo memperoleh data operasional maupun pelanggan melalui:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Pendaftaran akun Superadmin (Nama, Email, Nomor Telepon).</li>
                  <li>Input data pesanan oleh kasir (Data menu, Harga, Transaksi harian).</li>
                  <li>Data pelanggan yang menggunakan fitur Loyalty PWA (Nomor HP, Nama).</li>
                </ul>
              </div>

              <div id="penggunaan" className="scroll-mt-40 mb-12">
                <h2 className="text-[20px] font-black text-[#1a1f36] mb-4 uppercase tracking-wide">2. Penggunaan Data</h2>
                <p>Data yang kami peroleh sepenuhnya digunakan untuk kepentingan operasional bisnis Anda. Kami menggunakan data tersebut untuk menghasilkan laporan analitik, mengelola poin loyalitas pelanggan Anda, dan memastikan transaksi (baik kasir maupun pembayaran QRIS) berjalan dengan aman dan akurat. Kami <strong>tidak pernah</strong> menjual data Anda ke pihak ketiga.</p>
              </div>

              <div id="keamanan" className="scroll-mt-40">
                <h2 className="text-[20px] font-black text-[#1a1f36] mb-4 uppercase tracking-wide">3. Jaminan Keamanan Data</h2>
                <p>Kafiloo menggunakan enkripsi standar industri dan penyimpanan database yang aman (diisolasi per tenant/toko) untuk mencegah akses yang tidak sah. Kami membatasi akses data internal kami dan hanya mengizinkan personel yang berwenang untuk memelihara server dan layanan aplikasi.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}