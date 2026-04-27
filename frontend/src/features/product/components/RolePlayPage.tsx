"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppHeader } from "@/features/app/components/AppHeader";
import { FeatureState } from "./FeatureState";
import {
  useRolePlayResponse,
  useRolePlayScenarios,
} from "../hooks/useProductFeatures";

export function RolePlayPage() {
  const {
    data: scenarioList,
    error,
    isLoading,
    session,
  } = useRolePlayScenarios();
  const response = useRolePlayResponse();
  const [message, setMessage] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");

  useEffect(() => {
    if (!selectedScenario && scenarioList?.scenarios[0]) {
      setSelectedScenario(scenarioList.scenarios[0].slug);
    }
  }, [scenarioList, selectedScenario]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sent = await response.sendResponse(selectedScenario, message);
    if (sent) {
      setMessage("");
    }
  }

  return (
    <main className="app-shell">
      <AppHeader user={session?.user ?? response.session?.user} />
      <section className="feature-hero">
        <p className="eyebrow">Role Play</p>
        <h1>Treine situações reais com correção em tempo real</h1>
        <p>Escolha entrevista, café ou viagem e responda como faria no mundo real.</p>
      </section>

      <FeatureState error={error} isLoading={isLoading} />

      {scenarioList ? (
        <section className="conversation-layout">
          <article className="feature-panel">
            <h2>Situações</h2>
            <div className="scenario-list">
              {scenarioList.scenarios.map((scenario) => (
                <label className="scenario-option" key={scenario.slug}>
                  <input
                    checked={selectedScenario === scenario.slug}
                    name="scenario"
                    onChange={() => setSelectedScenario(scenario.slug)}
                    type="radio"
                  />
                  <span>
                    <strong>{scenario.title}</strong>
                    <small>{scenario.situation}</small>
                    <small>{scenario.first_prompt}</small>
                  </span>
                </label>
              ))}
            </div>
          </article>

          <form className="feature-panel conversation-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="role-play-message">Resposta do role play</label>
              <textarea
                id="role-play-message"
                onChange={(event) => setMessage(event.target.value)}
                required
                rows={5}
                value={message}
              />
            </div>
            {response.error ? (
              <div className="login-error" role="alert">
                {response.error}
              </div>
            ) : null}
            <button className="login-submit" disabled={response.isPending} type="submit">
              Responder
            </button>

            {response.feedback ? (
              <div className="feedback-stack">
                <p>{response.feedback.correction}</p>
                <p>{response.feedback.next_prompt}</p>
                <div className="tag-list">
                  {response.feedback.suggested_vocabulary.map((term) => (
                    <span key={term}>{term}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </form>
        </section>
      ) : null}
    </main>
  );
}
