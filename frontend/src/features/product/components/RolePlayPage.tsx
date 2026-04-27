"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppHeader } from "@/features/app/components/AppHeader";
import { Sidebar } from "@/features/app/components/Sidebar";
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
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar user={session?.user ?? response.session?.user} />
      <AppHeader user={session?.user ?? response.session?.user} title="Role Play" />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <section className="mb-12">
            <h2 className="text-[32px] font-bold text-white mb-2">Role Play</h2>
            <p className="text-neutral-400 text-lg">Practice real-life situations with instant AI feedback.</p>
          </section>

          <FeatureState error={error} isLoading={isLoading} />

          {scenarioList ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <aside className="lg:col-span-4 space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Select Scenario</h3>
                <div className="space-y-3">
                  {scenarioList.scenarios.map((scenario) => {
                    const isSelected = selectedScenario === scenario.slug;
                    return (
                      <label 
                        key={scenario.slug}
                        className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-indigo-900/20 border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.1)]" 
                            : "bg-surface-container border-white/5 hover:border-white/10"
                        }`}
                      >
                        <input
                          checked={isSelected}
                          className="mt-1 accent-primary"
                          name="scenario"
                          onChange={() => setSelectedScenario(scenario.slug)}
                          type="radio"
                        />
                        <div className="flex flex-col gap-1">
                          <strong className={`font-bold ${isSelected ? "text-white" : "text-neutral-300"}`}>{scenario.title}</strong>
                          <small className="text-neutral-500">{scenario.situation}</small>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </aside>

              <div className="lg:col-span-8 space-y-6">
                <form 
                  className="p-8 rounded-2xl bg-surface-container-high border border-white/5 space-y-6" 
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500" htmlFor="role-play-message">
                      Your Response
                    </label>
                    <textarea
                      className="w-full bg-[#121217] border border-white/10 rounded-xl p-4 text-on-surface placeholder-neutral-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[160px] resize-none transition-all"
                      id="role-play-message"
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Respond as you would in this situation..."
                      required
                      value={message}
                    />
                  </div>
                  
                  {response.error && (
                    <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium">
                      {response.error}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button 
                      className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed" 
                      disabled={response.isPending} 
                      type="submit"
                    >
                      {response.isPending ? "Sending..." : "Send Response"}
                    </button>
                  </div>
                </form>

                {response.feedback && (
                  <div className="p-8 rounded-2xl bg-surface-container border-l-4 border-tertiary space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-tertiary/20 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-tertiary">auto_fix_high</span>
                      </div>
                      <div className="space-y-4">
                        <p className="text-lg text-white leading-relaxed">{response.feedback.correction}</p>
                        
                        <div className="p-4 bg-white/5 rounded-xl space-y-2">
                          <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-tertiary">Next Prompt</p>
                          <p className="text-on-surface">{response.feedback.next_prompt}</p>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">Suggested Vocabulary</p>
                          <div className="flex flex-wrap gap-2">
                            {response.feedback.suggested_vocabulary.map((term) => (
                              <span key={term} className="px-3 py-1 bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 rounded-full text-xs font-bold">
                                {term}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
