"use client";

import { usePathname } from "next/navigation";
import type { AuthUser } from "@/features/auth/domain/types";

type AppHeaderProps = {
  user?: AuthUser | null;
  title?: string;
};

export function AppHeader({ user, title = "Dashboard" }: AppHeaderProps) {
  const pathname = usePathname();
  
  // Map pathname to title if not provided
  const getTitle = () => {
    if (title !== "Dashboard") return title;
    if (pathname === "/app/plan") return "Immersion Plan";
    if (pathname === "/app/chat") return "AI Chat";
    if (pathname === "/app/memorization") return "Memorization";
    if (pathname === "/app/role-play") return "Role Play";
    if (pathname === "/app/ranking") return "Global Ranking";
    if (pathname === "/app/settings") return "Settings";
    return "Dashboard";
  };

  return (
    <header className="w-full h-16 border-b border-white/10 fixed top-0 z-40 bg-[#09090B]/80 backdrop-blur-md flex items-center justify-between pl-8 lg:pl-72 pr-8 font-manrope">
      <div className="flex items-center gap-4">
        <h1 className="text-[24px] font-semibold text-white">{getTitle()}</h1>
        <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
        <div className="hidden md:flex gap-4 text-neutral-400">
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> Level 24
          </span>
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> 1,240 XP
          </span>
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span> 15 Day Streak
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-neutral-400 hover:text-white transition-opacity opacity-80 hover:opacity-100">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
        <button className="p-2 text-neutral-400 hover:text-white transition-opacity opacity-80 hover:opacity-100">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity hidden sm:block">
          Start Lesson
        </button>
      </div>
    </header>
  );
}
