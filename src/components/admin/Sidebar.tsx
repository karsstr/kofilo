"use client";

// =============================================================
// Sidebar Component — /components/admin/Sidebar.tsx
// Navigasi CMS untuk SUPER_ADMIN (Premium Craft Coffee Theme)
// =============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/auth";

interface Props {
  user: SessionUser;
}

const NAV_ITEMS = [
  {
    href: "/cms/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    href: "/cms/products",
    label: "Menu Management",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "Loyalty Hub",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "Store Settings",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/cms/users",
    label: "User Access",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col min-h-screen text-[#1a1f36] relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
      
      {/* ── Brand Header ───────────────────────────────────── */}
      <div className="px-7 py-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6C4E31] to-[#583f27] flex items-center justify-center text-white text-xl shadow-[0_4px_12px_rgba(108,78,49,0.3)] relative">
          <span className="font-black text-xl tracking-tighter">C</span>
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 rounded-2xl"></div>
        </div>
        <div>
          <h1 className="font-black text-[17px] leading-tight tracking-tight text-[#1a1f36]">Craft Coffee</h1>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-0.5">Workspace</p>
        </div>
      </div>

      {/* ── Navigation Menu ────────────────────────────────── */}
      <nav className="flex-1 px-4 py-2 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isStub = item.href === "#";

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (isStub) {
                  e.preventDefault();
                  alert(`${item.label} is currently a mock feature for visual representation.`);
                }
              }}
              className={`
                flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14.5px] transition-all duration-200 ease-out group
                ${isActive
                  ? "bg-[#F7F7F8] text-[#1a1f36] font-extrabold border-2 border-[#1a1f36] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)]"
                  : "text-[#6B7280] font-medium border-2 border-transparent hover:text-[#1a1f36] hover:bg-gray-50"
                }
              `}
            >
              <span className={`transition-colors duration-200 [&>svg]:stroke-[${isActive ? '2.5' : '1.5'}] ${isActive ? "text-[#1a1f36]" : "text-gray-400 group-hover:text-[#1a1f36]"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Widget (Profile Card & Logout) ──────────── */}
      <div className="mt-auto p-4 mb-2">
        <div className="bg-white border border-gray-100 rounded-[24px] p-3 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] transition-shadow duration-300">
          
          {/* Info Profil */}
          <div className="flex items-center gap-3 mb-3 px-2 pt-1">
            <div className="w-[42px] h-[42px] rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-black text-[#1a1f36] text-[14px]">
              {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14.5px] font-black text-[#1a1f36] leading-tight truncate">{user.name}</h4>
              <p className="text-[12px] font-bold text-gray-400 capitalize mt-0.5">{user.role.toLowerCase().replace("_", " ")}</p>
            </div>
          </div>

          {/* Tombol Logout */}
          <a
            href="/api/auth/logout"
            className="flex items-center justify-center gap-2.5 w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-[14px] transition-colors duration-200 font-extrabold text-[13px] group"
          >
            <svg className="w-[18px] h-[18px] group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>Logout</span>
          </a>
          
        </div>
      </div>
      
    </aside>
  );
}