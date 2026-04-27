"use client";

import { AppHeader } from "@/features/app/components/AppHeader";
import { Sidebar } from "@/features/app/components/Sidebar";
import { useDailyImmersionPlan } from "../hooks/useProductFeatures";
import { FeatureState } from "./FeatureState";

export function ImmersionPlanPage() {
  const { data: plan, error, isLoading, session } = useDailyImmersionPlan();

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar user={session?.user} />
      <AppHeader user={session?.user} title="Immersion Plan" />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <FeatureState error={error} isLoading={isLoading} />

          {plan ? (
            <>
              {/* 7-Day Roadmap Header */}
              <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-[32px] font-bold text-white mb-2">Weekly Roadmap</h2>
                    <p className="text-neutral-400 text-lg">Your personalized path to fluency for this week.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl border border-white/5 self-start">
                    <button className="px-4 py-2 text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500 hover:text-white">Previous</button>
                    <button className="px-4 py-2 text-[12px] font-bold tracking-[0.1em] uppercase bg-primary/20 text-primary rounded-lg border border-primary/30">Current Week</button>
                    <button className="px-4 py-2 text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500 hover:text-white">Next</button>
                  </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                  {[24, 25, 26, 27, 28, 29, 30].map((dayNum, idx) => {
                    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
                    const isToday = dayNum === 26;
                    const isCompleted = dayNum < 26;
                    
                    return (
                      <div 
                        key={dayNum}
                        className={`relative p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                          isToday 
                            ? "bg-indigo-900/20 border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.15)]" 
                            : isCompleted 
                              ? "bg-surface-container-high border-white/5" 
                              : "bg-surface-container-lowest border-white/5 opacity-60"
                        }`}
                      >
                        {isToday && (
                          <div className="absolute -top-3 px-3 py-1 bg-indigo-400 text-on-primary rounded-full text-[10px] font-bold tracking-[0.1em] uppercase">TODAY</div>
                        )}
                        <span className={`text-[12px] font-bold tracking-[0.1em] uppercase ${isToday ? "text-indigo-400" : "text-neutral-500"}`}>{days[idx]}</span>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isToday 
                            ? "bg-indigo-400" 
                            : isCompleted 
                              ? "bg-tertiary/20 border border-tertiary/30" 
                              : "bg-white/5 border border-white/10"
                        }`}>
                          <span className={`material-symbols-outlined ${
                            isToday 
                              ? "text-on-primary" 
                              : isCompleted 
                                ? "text-tertiary" 
                                : "text-neutral-600"
                          }`}>
                            {isToday ? "play_arrow" : isCompleted ? "check_circle" : "lock"}
                          </span>
                        </div>
                        <span className="text-[24px] font-bold text-white">{dayNum}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Learning Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Progress Summary Card */}
                <div className="md:col-span-4 p-8 rounded-2xl bg-surface-container-high border border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[24px] font-bold text-white mb-2">Today's Focus</h3>
                    <p className="text-neutral-400 text-lg mb-6">{plan.title}</p>
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">
                          <span>Daily Progress</span>
                          <span>65%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-secondary w-[65%] rounded-full"></div>
                        </div>
                      </div>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-tertiary">
                          <span className="material-symbols-outlined text-xl">check_circle</span>
                          <span className="text-lg">Essential Phrases</span>
                        </li>
                        <li className="flex items-center gap-3 text-tertiary">
                          <span className="material-symbols-outlined text-xl">check_circle</span>
                          <span className="text-lg">Thematic Vocabulary</span>
                        </li>
                        <li className="flex items-center gap-3 text-neutral-400">
                          <span className="material-symbols-outlined text-xl">radio_button_unchecked</span>
                          <span className="text-lg">Grammar Points ({plan.grammar_points.length} left)</span>
                        </li>
                        <li className="flex items-center gap-3 text-neutral-400">
                          <span className="material-symbols-outlined text-xl">radio_button_unchecked</span>
                          <span className="text-lg">Final Quiz</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button className="mt-8 w-full py-4 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-opacity">Continue Lesson</button>
                </div>

                {/* Learning Sections Grid */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Essential Phrases Section */}
                  <div className="p-6 rounded-2xl bg-surface-container border-l-4 border-tertiary bg-white/[0.02]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-tertiary/10 rounded-lg">
                        <span className="material-symbols-outlined text-tertiary">record_voice_over</span>
                      </div>
                      <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-tertiary">COMPLETED</span>
                    </div>
                    <h4 className="text-[24px] font-bold text-white mb-1">{plan.essential_phrases.length} Phrases</h4>
                    <p className="text-neutral-500 text-lg mb-4">Master common business greetings and closings.</p>
                    <button className="text-tertiary font-bold text-sm flex items-center gap-1 hover:underline">
                      Review list <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>

                  {/* Thematic Vocabulary Section */}
                  <div className="p-6 rounded-2xl bg-surface-container border-l-4 border-tertiary bg-white/[0.02]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-tertiary/10 rounded-lg">
                        <span className="material-symbols-outlined text-tertiary">menu_book</span>
                      </div>
                      <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-tertiary">COMPLETED</span>
                    </div>
                    <h4 className="text-[24px] font-bold text-white mb-1">{plan.vocabulary_words.length} Words</h4>
                    <p className="text-neutral-500 text-lg mb-4">Theme: Strategic Partnership Terms.</p>
                    <button className="text-tertiary font-bold text-sm flex items-center gap-1 hover:underline">
                      Review list <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>

                  {/* Grammar Points Section */}
                  <div className="p-6 rounded-2xl bg-surface-container border-l-4 border-primary/50 bg-indigo-900/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <span className="material-symbols-outlined text-primary">rule</span>
                      </div>
                      <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-primary">INCOMPLETE</span>
                    </div>
                    <h4 className="text-[24px] font-bold text-white mb-1">Grammar Points</h4>
                    <p className="text-neutral-500 text-lg mb-4">Subjunctive mood in formal requests.</p>
                    <button className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/30 transition-colors">
                      Resume Study
                    </button>
                  </div>

                  {/* Speaking Exercise Section */}
                  <div className="p-6 rounded-2xl bg-surface-container border-l-4 border-secondary/50 bg-white/[0.02]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <span className="material-symbols-outlined text-secondary">mic</span>
                      </div>
                      <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500">INCOMPLETE</span>
                    </div>
                    <h4 className="text-[24px] font-bold text-white mb-1">Speaking Exercise</h4>
                    <p className="text-neutral-500 text-lg mb-4">{plan.speaking_exercise.slice(0, 60)}...</p>
                    <button className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/10 transition-colors">
                      Begin Practice
                    </button>
                  </div>

                  {/* Final Quiz Section (Full Width in Inner Grid) */}
                  <div className="sm:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-surface-container to-[#18181B] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-surface-container-high rounded-full border border-white/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-3xl">quiz</span>
                        </div>
                        <div>
                          <h4 className="text-[32px] font-bold text-white mb-1">Day {plan.day} Final Quiz</h4>
                          <p className="text-neutral-400 text-lg">{plan.quiz.title}</p>
                        </div>
                      </div>
                      <button className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-extrabold flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all self-start md:self-auto">
                        Take Final Exam <span className="material-symbols-outlined">bolt</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
