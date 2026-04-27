"use client";

import { useMemorizationSession } from "../hooks/useProductFeatures";
import { FeatureState } from "./FeatureState";

export function MemorizationSessionPage() {
  const { data: sessionData, error, isLoading } = useMemorizationSession();

  return (
    <main className="max-w-4xl mx-auto px-8 py-12">
      <FeatureState error={error} isLoading={isLoading} />

      {sessionData ? (
        <>
          {/* Session Header & Progress */}
          <section className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-indigo-400 font-bold tracking-[0.1em] uppercase text-[10px] block mb-2">Active Session</span>
                <h2 className="text-[32px] font-bold text-white">Daily Vocabulary Mastery</h2>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 font-bold tracking-[0.1em] uppercase text-[10px]">Word 1 of {sessionData.words.length}</span>
                <p className="text-indigo-400 font-bold text-[24px]">0%</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: "5%" }}></div>
            </div>
          </section>

          {/* Flashcard Content Area */}
          <section className="relative group">
            {/* Decoration Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            
            {/* Primary Flashcard */}
            <div className="relative bg-[#121217] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              {/* Card Header Image */}
              <div className="w-full h-48 relative overflow-hidden">
                <img 
                  alt="Memory Concept" 
                  className="w-full h-full object-cover opacity-60" 
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-8">
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-[0.1em] uppercase">ADJECTIVE</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="px-8 pb-10 pt-4">
                <div className="flex justify-between items-start mb-6 text-on-surface">
                  <h3 className="text-[48px] font-bold font-manrope">{sessionData.words[0].word}</h3>
                  <button className="p-2 text-neutral-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">volume_up</span>
                  </button>
                </div>

                {/* Bento Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Definition & Example */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-indigo-400 font-bold tracking-[0.1em] uppercase text-[10px] mb-2">DEFINITION</h4>
                      <p className="text-lg text-on-surface">{sessionData.words[0].definition}</p>
                    </div>
                    <div>
                      <h4 className="text-indigo-400 font-bold tracking-[0.1em] uppercase text-[10px] mb-2">REAL-LIFE EXAMPLE</h4>
                      <div className="bg-white/5 border-l-2 border-indigo-500/50 p-4 rounded-r-lg italic text-neutral-400 leading-relaxed">
                        {sessionData.words[0].example_sentence}
                      </div>
                    </div>
                  </div>

                  {/* Mnemonic Card */}
                  <div className="bg-surface-container-high border border-white/5 p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <span className="material-symbols-outlined text-6xl text-white">lightbulb</span>
                    </div>
                    <h4 className="text-tertiary font-bold tracking-[0.1em] uppercase text-[10px] mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      MEMORY TRICK
                    </h4>
                    <p className="text-body-md text-on-surface leading-relaxed relative z-10">
                      {sessionData.words[0].memory_tip}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded border border-tertiary/20">MNEMONIC</span>
                      <span className="px-2 py-1 bg-white/10 text-neutral-400 text-[10px] font-bold rounded border border-white/10">PHONETIC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="mt-12 flex items-center justify-center gap-6">
              <button className="group flex items-center gap-3 px-8 py-4 bg-surface-container-low border border-white/10 text-neutral-300 rounded-xl font-semibold hover:border-red-400/40 hover:text-red-400 transition-all scale-95 active:scale-90">
                <span className="material-symbols-outlined transition-transform group-hover:rotate-12">history</span>
                Review later
              </button>
              <button className="group flex items-center gap-3 px-12 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(189,194,255,0.4)] transition-all scale-95 active:scale-90">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                I know this
              </button>
            </div>
          </section>

          {/* Upcoming Queue */}
          <section className="mt-16 pt-8 border-t border-white/5">
            <h5 className="text-neutral-500 font-bold tracking-[0.1em] uppercase text-[10px] mb-6">Up next in this session</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {sessionData.words.slice(1, 4).map((word, idx) => (
                <div key={idx} className="bg-[#121217] border border-white/10 p-4 rounded-lg">
                  <p className="text-sm font-bold text-white mb-1">{word.word}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{word.definition.slice(0, 30)}...</p>
                </div>
              ))}
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-lg flex items-center justify-center">
                <span className="text-[10px] font-bold text-indigo-400">+{sessionData.words.length - 4} MORE</span>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {/* Keyboard Shortcuts Helper */}
      <div className="fixed bottom-6 right-8 hidden md:flex gap-6 text-[10px] font-bold tracking-[0.1em] uppercase text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">SPACE</span>
          <span>FLIP CARD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">←</span>
          <span>LATER</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">→</span>
          <span>GOT IT</span>
        </div>
      </div>
    </main>
  );
}
