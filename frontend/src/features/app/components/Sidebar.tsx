"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/features/auth/domain/types";
import { clearAuthSession } from "@/features/auth/services/authSession";

type SidebarProps = {
  user?: AuthUser | null;
  isOpen?: boolean;
  onClose?: () => void;
};

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/app" },
  { label: "Immersion Plan", icon: "auto_stories", href: "/app/plan" },
  { label: "AI Chat", icon: "smart_toy", href: "/app/chat" },
  { label: "Knowledge Base", icon: "database", href: "/app/knowledge" },
  { label: "Memorization", icon: "psychology", href: "/app/memorization" },
  { label: "Role Play", icon: "theater_comedy", href: "/app/role-play" },
];

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  if (!mounted) {
    return (
      <aside className="h-screen w-64 border-r border-white/10 fixed left-0 top-0 flex flex-col py-8 px-4 bg-[#09090B] hidden lg:flex" />
    );
  }

  return (
    <aside className={`h-screen w-64 border-r border-white/10 fixed left-0 top-0 flex flex-col py-8 px-4 bg-[#09090B] font-manrope antialiased tracking-tight z-50 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    } lg:flex`}>
      <div className="mb-10 px-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-xl">language</span>
          </div>
          <span className="text-indigo-400 font-extrabold text-xl">FluencyAI</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-neutral-400 hover:text-white">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.label === "Knowledge Base" && !user?.is_admin) {
            return null;
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "text-indigo-400 bg-indigo-400/10 border-r-2 border-indigo-400 font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 mt-8 border-t border-white/10 space-y-2">
        <div className="px-3 mb-4">
          <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">Profile</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden border border-white/20">
              {user?.avatar_url ? (
                <img className="w-full h-full object-cover" src={user.avatar_url} alt="Profile" />
              ) : (
                <span className="text-on-primary font-bold">{user?.email?.slice(0, 1).toUpperCase() ?? "U"}</span>
              )}
            </div>
            <div>
              <p className="text-white font-bold text-sm">Level {user?.level ?? 1} Learner</p>
              <p className="text-neutral-500 text-xs">Premium Member</p>
            </div>
          </div>
        </div>
        
        <Link 
          href="/app/settings" 
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-body-md">Settings</span>
        </Link>
        <Link 
          href="/app/ranking" 
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
        >
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="text-body-md">Global Ranking</span>
        </Link>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-colors mt-4"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-body-md font-bold uppercase tracking-wider text-[11px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
