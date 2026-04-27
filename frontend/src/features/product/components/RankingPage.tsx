"use client";

import { AppHeader } from "@/features/app/components/AppHeader";
import { FeatureState } from "./FeatureState";
import {
  useGamificationSummary,
  useGlobalRanking,
} from "../hooks/useProductFeatures";

export function RankingPage() {
  const summary = useGamificationSummary();
  const ranking = useGlobalRanking();

  return (
    <main className="app-shell">
      <AppHeader user={summary.session?.user ?? ranking.session?.user} />
      <section className="feature-hero">
        <p className="eyebrow">Gamificação</p>
        <h1>XP, streak, nível e ranking global</h1>
        <p>Acompanhe sua progressão e compare seu avanço com outros estudantes.</p>
      </section>

      <FeatureState
        error={summary.error ?? ranking.error}
        isLoading={summary.isLoading || ranking.isLoading}
      />

      {summary.data ? (
        <section className="metric-grid product-metrics" aria-label="Resumo de gamificação">
          <article className="metric-card">
            <span>XP</span>
            <strong>{summary.data.xp} XP</strong>
          </article>
          <article className="metric-card">
            <span>Nível</span>
            <strong>{summary.data.level}</strong>
          </article>
          <article className="metric-card">
            <span>Streak</span>
            <strong>{summary.data.streak} dias</strong>
          </article>
          <article className="metric-card">
            <span>Palavras aprendidas</span>
            <strong>{summary.data.words_learned}</strong>
          </article>
        </section>
      ) : null}

      {ranking.data ? (
        <section className="feature-panel ranking-panel">
          <h2>Ranking global</h2>
          <div className="ranking-list">
            {ranking.data.entries.map((entry) => (
              <div className="ranking-row" key={`${entry.rank}-${entry.email}`}>
                <strong>#{entry.rank}</strong>
                <span>{entry.email}</span>
                <span>{entry.xp} XP</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
