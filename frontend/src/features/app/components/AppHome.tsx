"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthSession } from "../hooks/useAuthSession";

export function AppHome() {
  const session = useAuthSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) {
    return null;
  }

  const { user } = session;

  return (
    <main className="max-w-6xl mx-auto px-8 py-12">
      <section className="mb-12">
        <h2 className="text-[32px] font-bold text-on-surface mb-2 font-manrope">Welcome back, {user.email.split('@')[0]}</h2>
        <p className="text-on-surface/60 text-lg">Continue your language immersion journey.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <article className="p-6 rounded-2xl bg-surface border border-outline/10 flex flex-col gap-2 shadow-sm">
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-on-surface/40">XP Earned</span>
          <strong className="text-[32px] font-bold text-on-surface">{user.xp} XP</strong>
        </article>
        <article className="p-6 rounded-2xl bg-surface border border-outline/10 flex flex-col gap-2 shadow-sm">
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-on-surface/40">Current Level</span>
          <strong className="text-[32px] font-bold text-on-surface">{user.level}</strong>
        </article>
        <article className="p-6 rounded-2xl bg-surface border border-outline/10 flex flex-col gap-2 shadow-sm">
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-on-surface/40">Day Streak</span>
          <strong className="text-[32px] font-bold text-on-surface">{user.streak} days</strong>
        </article>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/app/plan" className="group p-6 rounded-2xl bg-surface border border-outline/10 hover:border-primary/50 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">auto_stories</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2 font-manrope">Immersion Plan</h3>
          <p className="text-on-surface/60 text-sm">7-day roadmap with phrases, vocabulary, and grammar.</p>
        </Link>

        <Link href="/app/chat" className="group p-6 rounded-2xl bg-surface border border-outline/10 hover:border-primary/50 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2 font-manrope">AI Chat</h3>
          <p className="text-on-surface/60 text-sm">Practice natural conversations with real-time feedback.</p>
        </Link>

        <Link href="/app/knowledge" className="group p-6 rounded-2xl bg-surface border border-outline/10 hover:border-primary/50 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center mb-4 group-hover:bg-tertiary/20 transition-colors">
            <span className="material-symbols-outlined text-tertiary">database</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2 font-manrope">Knowledge Base</h3>
          <p className="text-on-surface/60 text-sm">Explore and manage documents used by your personal AI.</p>
        </Link>

        <Link href="/app/memorization" className="group p-6 rounded-2xl bg-surface border border-outline/10 hover:border-primary/50 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">psychology</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2 font-manrope">Memorization</h3>
          <p className="text-on-surface/60 text-sm">Flashcards and memory tricks for rapid vocabulary growth.</p>
        </Link>

        <Link href="/app/role-play" className="group p-6 rounded-2xl bg-surface border border-outline/10 hover:border-primary/50 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">theater_comedy</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2 font-manrope">Role Play</h3>
          <p className="text-on-surface/60 text-sm">Simulate real-world situations like coffee shops or airports.</p>
        </Link>

        <Link href="/app/settings" className="group p-6 rounded-2xl bg-surface border border-outline/10 hover:border-primary/50 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">settings</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2 font-manrope">Settings</h3>
          <p className="text-on-surface/60 text-sm">Configure your profile, learning goals, and account.</p>
        </Link>
      </section>
    </main>
  );
}
