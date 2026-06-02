"use client";

import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/features/auth/domain/types";
import {
  START_LESSON_EVENT,
  START_LESSON_STORAGE_KEY,
} from "@/features/product/domain/immersionStart";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

type AppHeaderProps = {
  user?: AuthUser | null;
  title?: string;
  onMenuToggle?: () => void;
};

export function AppHeader({ user, title = "Dashboard", onMenuToggle }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const flameClass = getStreakFlameClass(user?.streak ?? 0);
  
  // Map pathname to title if not provided
  const getTitle = () => {
    if (title !== "Dashboard") return title;
    if (pathname === "/app/plan") return "Immersion Plan";
    if (pathname === "/app/chat") return "AI Chat";
    if (pathname === "/app/memorization") return "Memorization";
    if (pathname === "/app/role-play") return "Role Play";
    if (pathname === "/app/ranking") return "Global Ranking";
    if (pathname === "/app/settings") return "Settings";
    if (pathname === "/app/social") return "Social";
    if (pathname === "/app/knowledge") return "Knowledge Base";
    return "Dashboard";
  };

  const handleStartLesson = () => {
    window.sessionStorage.setItem(START_LESSON_STORAGE_KEY, "1");
    window.dispatchEvent(new Event(START_LESSON_EVENT));

    if (pathname !== "/app/plan") {
      router.push("/app/plan");
    }
  };

  return (
    <header className="w-full h-16 border-b border-outline/10 fixed top-0 z-40 bg-surface/80 backdrop-blur-md flex items-center justify-between pl-4 lg:pl-72 pr-4 lg:pr-8 font-manrope">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-on-surface/60 hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-[18px] lg:text-[24px] font-semibold text-on-surface truncate">{getTitle()}</h1>
        <div className="h-4 w-[1px] bg-outline/10 hidden md:block"></div>
        <div className="hidden md:flex gap-4 text-on-surface/40">
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> Level {user?.level ?? 1}
          </span>
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> {user?.xp ?? 0} XP
          </span>
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase flex items-center gap-1">
            <span
              aria-label="Day streak flame"
              className={`material-symbols-outlined text-sm transition-colors ${flameClass}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>{" "}
            {user?.streak ?? 0} Day Streak
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        <ThemeToggle />
        <button className="p-2 text-on-surface/60 hover:text-on-surface transition-opacity opacity-80 hover:opacity-100">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          className="bg-primary text-on-primary px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-bold text-xs lg:text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          onClick={handleStartLesson}
          type="button"
        >
          Start Lesson
        </button>
      </div>
    </header>
  );
}

export function getStreakFlameClass(streak: number): string {
  if (streak <= 1) {
    return "text-primary";
  }

  const weekDay = ((streak - 1) % 7) + 1;
  const scale: Record<number, string> = {
    1: "text-primary",
    2: "text-yellow-300",
    3: "text-yellow-400",
    4: "text-orange-300",
    5: "text-orange-400",
    6: "text-orange-500",
    7: "text-red-500",
  };

  return scale[weekDay];
}
