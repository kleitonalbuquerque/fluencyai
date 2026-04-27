"use client";

import { FormEvent, useState } from "react";

import { AppHeader } from "@/features/app/components/AppHeader";
import { useAiConversation } from "../hooks/useProductFeatures";

export function AiConversationPage() {
  const { error, feedback, isPending, sendMessage, session } = useAiConversation();
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sent = await sendMessage(message);
    if (sent) {
      setMessage("");
    }
  }

  return (
    <main className="app-shell">
      <AppHeader user={session?.user} />
      <section className="feature-hero">
        <p className="eyebrow">Conversa com IA</p>
        <h1>Pratique como se estivesse com um falante nativo</h1>
        <p>Receba correções naturais e vocabulário melhor sem interromper o fluxo.</p>
      </section>

      <section className="conversation-layout">
        <form className="feature-panel conversation-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="ai-message">Mensagem para IA</label>
            <textarea
              id="ai-message"
              minLength={1}
              onChange={(event) => setMessage(event.target.value)}
              required
              rows={5}
              value={message}
            />
          </div>
          {error ? (
            <div className="login-error" role="alert">
              {error}
            </div>
          ) : null}
          <button className="login-submit" disabled={isPending} type="submit">
            Enviar
          </button>
        </form>

        <article className="feature-panel">
          <h2>Feedback</h2>
          {feedback ? (
            <div className="feedback-stack">
              <p>{feedback.reply}</p>
              <p>{feedback.correction}</p>
              <div className="tag-list">
                {feedback.suggested_vocabulary.map((term) => (
                  <span key={term}>{term}</span>
                ))}
              </div>
            </div>
          ) : (
            <p>Envie uma frase para iniciar a conversa.</p>
          )}
        </article>
      </section>
    </main>
  );
}
