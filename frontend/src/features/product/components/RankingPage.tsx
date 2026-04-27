"use client";

import { FeatureState } from "./FeatureState";
import {
  useGamificationSummary,
  useGlobalRanking,
} from "../hooks/useProductFeatures";

export function RankingPage() {
  const summary = useGamificationSummary();
  const ranking = useGlobalRanking();

  const user = summary.session?.user ?? ranking.session?.user;

  return (
    <main className="max-w-6xl mx-auto px-8 py-12">
      <section className="mb-12">
        <h1 className="text-[32px] font-bold text-white mb-2 font-manrope">Global Ranking</h1>
        <p className="text-neutral-400 text-lg">Track your progress and compare with other students.</p>
      </section>

      <FeatureState
        error={summary.error ?? ranking.error}
        isLoading={summary.isLoading || ranking.isLoading}
      />

      {summary.data ? (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <article className="p-6 rounded-2xl bg-surface-container-high border border-white/5 flex flex-col gap-2">
            <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">Total XP</span>
            <strong className="text-[32px] font-bold text-white">{summary.data.xp} XP</strong>
          </article>
          <article className="p-6 rounded-2xl bg-surface-container-high border border-white/5 flex flex-col gap-2">
            <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">Current Level</span>
            <strong className="text-[32px] font-bold text-white">{summary.data.level}</strong>
          </article>
          <article className="p-6 rounded-2xl bg-surface-container-high border border-white/5 flex flex-col gap-2">
            <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">Day Streak</span>
            <strong className="text-[32px] font-bold text-white">{summary.data.streak} days</strong>
          </article>
          <article className="p-6 rounded-2xl bg-surface-container-high border border-white/5 flex flex-col gap-2">
            <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">Words Learned</span>
            <strong className="text-[32px] font-bold text-white">{summary.data.words_learned}</strong>
          </article>
        </section>
      ) : null}

      {ranking.data ? (
        <section className="rounded-2xl bg-surface-container border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white font-manrope">Leaderboard</h2>
          </div>
          <div className="divide-y divide-white/5">
            {ranking.data.entries.map((entry) => {
              const isCurrentUser = entry.email === user?.email;
              return (
                <div 
                  key={`${entry.rank}-${entry.email}`}
                  className={`p-6 flex items-center justify-between transition-colors ${
                    isCurrentUser ? "bg-primary/5" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-6 text-on-surface">
                    <span className={`text-xl font-bold w-8 ${
                      entry.rank === 1 ? "text-yellow-400" : 
                      entry.rank === 2 ? "text-neutral-400" :
                      entry.rank === 3 ? "text-orange-400" : "text-neutral-600"
                    }`}>
                      #{entry.rank}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center font-bold text-white">
                        {entry.email.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold ${isCurrentUser ? "text-white" : "text-neutral-200"}`}>
                          {entry.email} {isCurrentUser && <span className="ml-2 text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded uppercase font-bold">You</span>}
                        </p>
                        <p className="text-xs text-neutral-500">Level {entry.level} • {entry.streak} day streak</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{entry.xp} XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
