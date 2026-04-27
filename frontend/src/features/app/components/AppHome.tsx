"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SettingsIcon } from "./AppIcons";
import { useAuthSession } from "../hooks/useAuthSession";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

function getInitials(email: string): string {
  return email.slice(0, 1).toUpperCase();
}

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
      <header className="app-header">
        <div className="app-brand">FluencyAI</div>
        <div className="app-actions">
          <ThemeToggle />
          <Link className="icon-link" href="/app/settings" aria-label="Configurações da conta">
            <SettingsIcon />
          </Link>
          <div className="avatar-chip" aria-label={user.email}>
            {user.avatar_url ? (
              <img alt="" src={user.avatar_url} />
            ) : (
              <span>{getInitials(user.email)}</span>
            )}
          </div>
        </div>
      </header>

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
    </main>
  );
}
