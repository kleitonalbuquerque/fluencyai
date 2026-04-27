"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/features/auth/domain/types";

type SidebarProps = {
  user?: AuthUser | null;
};

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/app" },
  { label: "Immersion Plan", icon: "auto_stories", href: "/app/plan" },
  { label: "AI Chat", icon: "smart_toy", href: "/app/chat" },
  { label: "Memorization", icon: "psychology", href: "/app/memorization" },
  { label: "Role Play", icon: "theater_comedy", href: "/app/role-play" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 border-r border-white/10 fixed left-0 top-0 flex flex-col py-8 px-4 bg-[#09090B] font-manrope antialiased tracking-tight hidden lg:flex">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-xl">language</span>
        </div>
        <span className="text-indigo-400 font-extrabold text-xl">FluencyAI</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
                <span className="text-on-primary font-bold">{user?.email?.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-white font-bold text-sm">Level 24 Learner</p>
              <p className="text-neutral-500 text-xs">Premium Member</p>
            </div>
          </div>
        </div>
        
        <Link 
          href="/app/settings" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-body-md">Settings</span>
        </Link>
        <Link 
          href="/app/ranking" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
        >
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="text-body-md">Global Ranking</span>
        </Link>
      </div>
    </aside>
  );
}
