"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppHeader } from "./AppHeader";
import { useAuthSession } from "../hooks/useAuthSession";

export function AppHome() {
  const router = useRouter();
  const session = useAuthSession();

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [router, session]);

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <main className="app-shell">
      <AppHeader user={user} />

      <section className="dashboard-hero">
        <p className="eyebrow">Plano diário</p>
        <h1>Continue sua imersão de idiomas</h1>
        <p>{user.email}</p>
      </section>

      <section className="metric-grid" aria-label="Resumo de progresso">
        <article className="metric-card">
          <span>XP</span>
          <strong>{user.xp} XP</strong>
        </article>
        <article className="metric-card">
          <span>Nível</span>
          <strong>{user.level}</strong>
        </article>
        <article className="metric-card">
          <span>Streak</span>
          <strong>{user.streak} dias</strong>
        </article>
      </section>

      <section className="feature-grid" aria-label="Funcionalidades do produto">
        <Link className="feature-card" href="/app/plan" aria-label="Plano de imersão">
          <span>01</span>
          <strong>Plano de imersão</strong>
          <p>7 dias com frases, vocabulário, gramática, fala e quiz.</p>
        </Link>
        <Link className="feature-card" href="/app/chat" aria-label="Conversa com IA">
          <span>02</span>
          <strong>Conversa com IA</strong>
          <p>Pratique uma conversa fluida com correção e vocabulário melhor.</p>
        </Link>
        <Link className="feature-card" href="/app/memorization" aria-label="Memorização">
          <span>03</span>
          <strong>Memorização</strong>
          <p>20 palavras por sessão com definição, exemplo e truque de memória.</p>
        </Link>
        <Link className="feature-card" href="/app/role-play" aria-label="Role Play">
          <span>04</span>
          <strong>Role Play</strong>
          <p>Situações reais como entrevista, café e viagem.</p>
        </Link>
        <Link className="feature-card" href="/app/ranking" aria-label="Ranking global">
          <span>05</span>
          <strong>Ranking global</strong>
          <p>Acompanhe XP, streak, nível e sua posição.</p>
        </Link>
        <Link className="feature-card" href="/app/social" aria-label="Compartilhamento social">
          <span>06</span>
          <strong>Compartilhamento social</strong>
          <p>Gere textos para compartilhar progresso e ranking.</p>
        </Link>
      </section>
    </main>
  );
}
