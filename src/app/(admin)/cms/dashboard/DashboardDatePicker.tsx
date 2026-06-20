"use client";

import { useRouter } from "next/navigation";

export default function DashboardDatePicker({ initialDate, displayDate }: { initialDate: string, displayDate: string }) {
  const router = useRouter();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    if (selected) {
      // Mengubah URL. Halaman Server Component (page.tsx) akan otomatis me-render ulang dengan data baru
      router.push(`/cms/dashboard?date=${selected}`);
    }
  };

  return (
    <div className="relative">
      {/* Input tipe date asli (native) disembunyikan (opacity-0) di atas UI Kustom kita.
        Ini cara paling aman dan stabil tanpa perlu menginstal library kalender berat tambahan.
      */}
      <input
        type="date"
        value={initialDate}
        onChange={handleDateChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      {/* UI Kalender Kustom bergaya Premium (yang terlihat oleh mata) */}
      <div className="flex items-center gap-2.5 bg-white px-5 h-[46px] border border-gray-200/80 rounded-2xl text-[13px] font-bold text-gray-600 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] group hover:border-[#6C4E31]/40 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-[#6C4E31] transition-colors">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
        </svg>
        <span className="group-hover:text-[#1a1f36] transition-colors">{displayDate}</span>
      </div>
    </div>
  );
}