"use client";

import { AppHeader } from "@/features/app/components/AppHeader";
import { FeatureState } from "./FeatureState";
import { useMemorizationSession } from "../hooks/useProductFeatures";

export function MemorizationSessionPage() {
  const { data: sessionData, error, isLoading, session } = useMemorizationSession();

  return (
    <main className="app-shell">
      <AppHeader user={session?.user} />
      <section className="feature-hero">
        <p className="eyebrow">Memorização</p>
        <h1>20 palavras por sessão</h1>
        <p>Definição simples, frase real e truque de memória para fixar até 100%.</p>
      </section>

      <FeatureState error={error} isLoading={isLoading} />

      {sessionData ? (
        <>
          <div className="mini-metrics">
            <span>Teste até {sessionData.target_accuracy}%</span>
            <span>{sessionData.words.length} palavras</span>
          </div>
          <section className="word-grid" aria-label="Palavras de memorização">
            {sessionData.words.map((word, index) => (
              <article className="feature-panel word-card" key={`${word.word}-${index}`}>
                <span className="feature-kicker">{word.theme}</span>
                <h2>{word.word}</h2>
                <p>{word.definition}</p>
                <p>{word.example_sentence}</p>
                <small>{word.memory_tip}</small>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </main>
  );
}
