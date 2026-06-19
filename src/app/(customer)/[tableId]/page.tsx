import Link from "next/link";

export default async function CustomerLandingPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 overflow-hidden bg-[#0f1222] selection:bg-[#6C4E31] selection:text-white font-sans">
      
      {/* ── 1. BACKGROUND GAMBAR KAFE ── */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2000&auto=format&fit=crop')" }}
      />
      
      {/* ── 2. OVERLAY GELAP AGAR TEKS TERBACA ── */}
      {/* Menggunakan overlay gelap merata agar elegan di tengah */}
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-brightness-[0.8]" />

      {/* ── 3. KONTEN UTAMA (TEPAT DI TENGAH) ── */}
      <div className="relative z-20 w-full max-w-md flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-1000 ease-out">
        
        {/* Logo Icon dengan efek Glassmorphism */}
        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-11 h-11 text-white opacity-90">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 3a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3.75A.75.75 0 017.5 3zM16.5 3a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3.75a.75.75 0 01.75-.75z" />
            <path fillRule="evenodd" d="M3 8.25A1.5 1.5 0 014.5 6.75h15a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-1.5a.75.75 0 00-.75.75v.52a8.251 8.251 0 01-5.748 7.922 4.5 4.5 0 01-5.004 0A8.251 8.251 0 016.75 12.02v-.52a.75.75 0 00-.75-.75H4.5a1.5 1.5 0 01-1.5-1.5v-1.5zm6.75 2.25a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-1.5z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Nama Brand */}
        <h1 className="text-[48px] leading-none font-black text-white tracking-tight mb-3 drop-shadow-lg">
          Kofilo
        </h1>
        
        {/* Indikator Nomor Meja yang Estetik */}
        <div className="flex items-center gap-4 mb-10 w-full px-4">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#6C4E31]/80"></span>
          <p className="text-gray-200 text-[13px] font-bold uppercase tracking-[0.25em] drop-shadow-md whitespace-nowrap">
            Table Dashboard
          </p>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#6C4E31]/80"></span>
        </div>

        {/* Tombol CTA (Call to Action) */}
        <Link 
          href={`/${tableId}/menu`}
          className="w-full bg-white text-[#0f1222] hover:bg-gray-100 py-4.5 rounded-[20px] font-extrabold text-[16px] transition-all duration-300 flex justify-center items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.4)] active:scale-[0.98] group"
        >
          View Menu & Order
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* ── 4. COPYRIGHT (DI BAWAH ABSOLUT) ── */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 animate-in fade-in duration-1000 delay-300">
        <p className="text-gray-400/60 text-[11px] font-semibold tracking-wide px-6 text-center">
          © {new Date().getFullYear()} KOFILO. PREMIUM COFFEE EXPERIENCE.
        </p>
      </div>

    </div>
  );
}