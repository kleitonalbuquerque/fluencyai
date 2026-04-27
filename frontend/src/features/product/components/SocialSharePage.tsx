"use client";

import { AppHeader } from "@/features/app/components/AppHeader";
import { FeatureState } from "./FeatureState";
import { useSocialProgressShare } from "../hooks/useProductFeatures";

export function SocialSharePage() {
  const { data, error, isLoading, session } = useSocialProgressShare();

  return (
    <main className="app-shell">
      <AppHeader user={session?.user} />
      <section className="feature-hero">
        <p className="eyebrow">Social</p>
        <h1>Compartilhe seu progresso</h1>
        <p>Use uma mensagem pronta para divulgar sua evolução e ranking.</p>
      </section>

      <FeatureState error={error} isLoading={isLoading} />

      {data ? (
        <section className="feature-panel share-panel">
          <h2>Mensagem de progresso</h2>
          <p>{data.share_text}</p>
          <span>{data.share_url}</span>
          <button
            className="login-submit"
            onClick={() => navigator.clipboard?.writeText(data.share_text)}
            type="button"
          >
            Copiar mensagem
          </button>
        </section>
      ) : null}
    </main>
  );
}
