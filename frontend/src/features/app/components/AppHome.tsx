"use client";

import Link from "next/link";
import { useAuthSession } from "../hooks/useAuthSession";

export function AppHome() {
  const session = useAuthSession();

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <main className="max-w-6xl mx-auto px-8 py-12">
      <section className="mb-12">
        <h2 className="text-[32px] font-bold text-white mb-2">Welcome back, {user.email.split('@')[0]}</h2>
        <p className="text-neutral-400 text-lg">Continue your language immersion journey.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <article className="p-6 rounded-2xl bg-surface-container-high border border-white/5 flex flex-col gap-2">
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">XP Earned</span>
          <strong className="text-[32px] font-bold text-white">{user.xp} XP</strong>
        </article>
        <article className="p-6 rounded-2xl bg-surface-container-high border border-white/5 flex flex-col gap-2">
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">Current Level</span>
          <strong className="text-[32px] font-bold text-white">{user.level}</strong>
        </article>
        <article className="p-6 rounded-2xl bg-surface-container-high border border-white/5 flex flex-col gap-2">
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">Day Streak</span>
          <strong className="text-[32px] font-bold text-white">{user.streak} days</strong>
        </article>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/app/plan" className="group p-6 rounded-2xl bg-surface-container border border-white/5 hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">auto_stories</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Immersion Plan</h3>
          <p className="text-neutral-500">7-day roadmap with phrases, vocabulary, and grammar.</p>
        </Link>

        <Link href="/app/chat" className="group p-6 rounded-2xl bg-surface-container border border-white/5 hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">AI Chat</h3>
          <p className="text-neutral-500">Practice natural conversations with real-time feedback.</p>
        </Link>

        <Link href="/app/memorization" className="group p-6 rounded-2xl bg-surface-container border border-white/5 hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">psychology</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Memorization</h3>
          <p className="text-neutral-500">Flashcards and memory tricks for rapid vocabulary growth.</p>
        </Link>

        <Link href="/app/role-play" className="group p-6 rounded-2xl bg-surface-container border border-white/5 hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">theater_comedy</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Role Play</h3>
          <p className="text-neutral-500">Simulate real-world situations like coffee shops or airports.</p>
        </Link>

        <Link href="/app/ranking" className="group p-6 rounded-2xl bg-surface-container border border-white/5 hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">leaderboard</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Global Ranking</h3>
          <p className="text-neutral-500">See how you stack up against other learners worldwide.</p>
        </Link>

        <Link href="/app/settings" className="group p-6 rounded-2xl bg-surface-container border border-white/5 hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary">settings</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
          <p className="text-neutral-500">Configure your profile, learning goals, and account.</p>
        </Link>
      </section>
    </main>
  );
}
