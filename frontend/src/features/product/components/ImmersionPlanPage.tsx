"use client";

import { AppHeader } from "@/features/app/components/AppHeader";
import { useDailyImmersionPlan } from "../hooks/useProductFeatures";
import { FeatureState } from "./FeatureState";

export function ImmersionPlanPage() {
  const { data: plan, error, isLoading, session } = useDailyImmersionPlan();

  return (
    <main className="app-shell">
      <AppHeader user={session?.user} />
      <section className="feature-hero">
        <p className="eyebrow">Plano de imersão</p>
        <h1>7 dias para ativar sua conversação</h1>
        <p>Frases, vocabulário, gramática, fala e quiz em um fluxo diário.</p>
      </section>

      <FeatureState error={error} isLoading={isLoading} />

      {plan ? (
        <section className="feature-layout">
          <article className="feature-panel feature-panel-wide">
            <span className="feature-kicker">Dia {plan.day}</span>
            <h2>{plan.title}</h2>
            <div className="mini-metrics">
              <span>{plan.essential_phrases.length} frases essenciais</span>
              <span>{plan.vocabulary_words.length} palavras por tema</span>
              <span>{plan.grammar_points.length} pontos de gramática</span>
            </div>
          </article>

          <article className="feature-panel">
            <h2>Frases essenciais</h2>
            <ul className="compact-list">
              {plan.essential_phrases.slice(0, 8).map((phrase, index) => (
                <li key={`${phrase.text}-${index}`}>
                  <strong>{phrase.text}</strong>
                  <span>{phrase.translation}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="feature-panel">
            <h2>Vocabulário</h2>
            <ul className="compact-list">
              {plan.vocabulary_words.slice(0, 8).map((word, index) => (
                <li key={`${word.word}-${index}`}>
                  <strong>{word.word}</strong>
                  <span>{word.definition}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="feature-panel">
            <h2>Gramática</h2>
            <ul className="compact-list">
              {plan.grammar_points.map((point) => (
                <li key={point.title}>
                  <strong>{point.title}</strong>
                  <span>{point.example}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="feature-panel">
            <h2>Exercício de fala</h2>
            <p>{plan.speaking_exercise}</p>
          </article>

          <article className="feature-panel feature-panel-wide">
            <h2>{plan.quiz.title}</h2>
            <ul className="compact-list">
              {plan.quiz.questions.map((question) => (
                <li key={question.prompt}>
                  <strong>{question.prompt}</strong>
                  <span>{question.answer}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      ) : null}
    </main>
  );
}
