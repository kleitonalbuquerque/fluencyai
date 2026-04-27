"use client";

import { useState } from "react";
import { AppHeader } from "@/features/app/components/AppHeader";
import { Sidebar } from "@/features/app/components/Sidebar";
import { useAiConversation } from "../hooks/useProductFeatures";
import { FeatureState } from "./FeatureState";

export function AiConversationPage() {
  const { error, feedback, isPending, sendMessage, session } = useAiConversation();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "¡Hola! ¿Cómo te va hoy? Estaba pensando en lo que dijiste ayer sobre mudarte a Madrid. ¿Ya has mirado algunos barrios?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    
    const success = await sendMessage(inputValue);
    if (success && feedback) {
      // Note: feedback handling would normally go here
    }
  };

  return (
    <div className="h-screen bg-[#09090B] text-on-background font-inter overflow-hidden">
      <Sidebar user={session?.user} />
      <AppHeader user={session?.user} title="AI Chat" />

      <main className="lg:pl-64 pt-16 h-screen flex">
        {/* Chat Interface */}
        <section className="flex-grow flex flex-col relative max-w-4xl mx-auto w-full px-8 py-6">
          <FeatureState error={error} isLoading={isPending} />
          
          {/* Chat Container */}
          <div className="flex-grow overflow-y-auto pr-4 space-y-8 pb-32 custom-scrollbar">
            {/* Date Separator */}
            <div className="flex justify-center">
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-neutral-500 bg-white/5 px-3 py-1 rounded-full">Today's Session • Immersion Mode</span>
            </div>

            {messages.map((msg, idx) => {
              const isAi = msg.role === "assistant";
              return (
                <div key={idx} className={`flex gap-4 ${!isAi ? "flex-row-reverse" : ""}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    isAi 
                      ? "bg-indigo-400/20 border-indigo-400/30" 
                      : "bg-surface-container-high border-white/10"
                  }`}>
                    <span className={`material-symbols-outlined ${isAi ? "text-indigo-400" : "text-white/40"}`}>
                      {isAi ? "smart_toy" : "person"}
                    </span>
                  </div>
                  <div className={`max-w-[80%] ${!isAi ? "text-right" : ""}`}>
                    <div className={`border p-4 rounded-2xl ${
                      isAi 
                        ? "bg-surface-container-low border-white/5 rounded-tl-none" 
                        : "bg-indigo-400/10 border-indigo-400/20 rounded-tr-none text-left"
                    }`}>
                      <p className="text-body-md text-on-surface">{msg.content}</p>
                    </div>
                    <span className={`text-[10px] text-neutral-500 mt-2 block ${isAi ? "ml-2" : "mr-2"}`}>
                      {isAi ? "Sofia • AI Tutor" : "You • Just now"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Example Correction Overlay (Hardcoded for visual parity with design) */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-tertiary/20 flex items-center justify-center flex-shrink-0 border border-tertiary/30">
                <span className="material-symbols-outlined text-tertiary">auto_fix_high</span>
              </div>
              <div className="max-w-[80%]">
                <div className="bg-surface-container-lowest border border-tertiary-container/20 p-4 rounded-2xl rounded-tl-none">
                  <p className="text-tertiary font-semibold text-sm mb-2 italic">Isso soa bem! Só uma coisinha pequena...</p>
                  <p className="text-body-md text-on-surface mb-3">
                    Em espanhol, "barrio" é masculino. Você deve dizer: "...porque es <span className="text-tertiary underline decoration-2">muy vivo</span>".
                  </p>
                  <div className="bg-white/5 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Context: Masculine vs Feminine</span>
                    <button className="text-[10px] font-bold tracking-[0.1em] uppercase text-indigo-400 hover:underline">Apply to memory</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="absolute bottom-6 left-8 right-8 bg-[#121217] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-neutral-400">Recording Focus Active</span>
              </div>
            </div>
            <div className="flex items-end gap-3 p-2">
              <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                <span className="material-symbols-outlined text-neutral-400">translate</span>
              </button>
              <div className="flex-grow relative">
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder-neutral-600 py-3 resize-none" 
                  placeholder="Reply in Spanish..." 
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>
              <button className="w-12 h-12 rounded-full bg-indigo-400 text-on-primary-container flex items-center justify-center shadow-lg shadow-indigo-400/20 hover:scale-105 active:scale-95 transition-all">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              </button>
              <button 
                onClick={handleSend}
                disabled={isPending}
                className="w-12 h-12 rounded-xl bg-indigo-400/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-400/20 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Sidebar: Vocabulary Suggestions */}
        <aside className="w-80 border-l border-white/10 bg-[#0E0E10] p-6 hidden xl:flex flex-col gap-6 overflow-y-auto">
          <div>
            <h3 className="text-on-surface font-bold text-base mb-4 flex items-center gap-2 font-manrope">
              <span className="material-symbols-outlined text-indigo-400">auto_awesome</span>
              Better Vocabulary
            </h3>
            <p className="text-xs text-neutral-400 mb-6">Suggestions based on your current conversation about <span className="text-indigo-400">Madrid & Neighborhoods</span>.</p>
            
            <div className="space-y-4">
              {[
                { word: "Animado/a", level: "B2", instead: "Tiene vida", meaning: "Lively, bustling." },
                { word: "Castizo", level: "C1", instead: "Authentic Madrid", meaning: "Pure, traditional, authentic." },
                { word: "Ajetreado", level: "B2", instead: "Mucho movimiento", meaning: "Hectic, busy, full of activity." }
              ].map((item, idx) => (
                <div key={idx} className="bg-surface-container-low border border-white/5 p-4 rounded-xl group hover:border-indigo-400/30 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-indigo-400 font-bold">{item.word}</span>
                    <span className="text-[10px] bg-indigo-400/10 text-indigo-300 px-2 py-0.5 rounded font-bold">{item.level}</span>
                  </div>
                  <p className="text-xs text-on-surface mb-1 italic">Instead of: "{item.instead}"</p>
                  <p className="text-xs text-neutral-500">Meaning: {item.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto bg-tertiary/5 border border-tertiary/10 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-tertiary text-sm">tips_and_updates</span>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-tertiary">Grammar Hint</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Remember that colors and personality adjectives must match the gender of the noun they describe. <br/>
              <span className="text-tertiary">Barrio (m) → Vivo</span><br/>
              <span className="text-tertiary">Ciudad (f) → Viva</span>
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
