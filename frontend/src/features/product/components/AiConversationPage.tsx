"use client";

import { useEffect, useRef, useState } from "react";
import { useAiConversation } from "../hooks/useProductFeatures";
import { FeatureState } from "./FeatureState";

type Message =
  | { role: "user" | "assistant"; content: string }
  | { role: "correction"; content: string };

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Hi! I'm Sofia, your AI language tutor. Send me a message in English and I'll help you practice and improve. What's on your mind today?",
  },
];

export function AiConversationPage() {
  const { error, isPending, sendMessage } = useAiConversation();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputValue("");

    const result = await sendMessage(text);
    if (result) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
        ...(result.correction
          ? [{ role: "correction" as const, content: result.correction }]
          : []),
      ]);
      if (result.suggested_vocabulary.length > 0) {
        setVocabulary(result.suggested_vocabulary);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Chat Interface */}
      <section className="flex-grow flex flex-col relative max-w-4xl mx-auto w-full px-8 py-6">
        <FeatureState error={error} isLoading={false} />

        {/* Chat Container */}
        <div className="flex-grow overflow-y-auto pr-4 space-y-8 pb-32 custom-scrollbar text-on-surface">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-neutral-500 bg-white/5 px-3 py-1 rounded-full">
              Today&apos;s Session • Immersion Mode
            </span>
          </div>

          {messages.map((msg, idx) => {
            if (msg.role === "correction") {
              return (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/20 flex items-center justify-center flex-shrink-0 border border-tertiary/30">
                    <span className="material-symbols-outlined text-tertiary">
                      auto_fix_high
                    </span>
                  </div>
                  <div className="max-w-[80%]">
                    <div className="bg-surface-container-lowest border border-tertiary-container/20 p-4 rounded-2xl rounded-tl-none">
                      <p className="text-tertiary font-semibold text-sm mb-2 italic">
                        Good try! Here&apos;s a small correction...
                      </p>
                      <p className="text-body-md text-on-surface">{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            }

            const isAi = msg.role === "assistant";
            return (
              <div key={idx} className={`flex gap-4 ${!isAi ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    isAi
                      ? "bg-indigo-400/20 border-indigo-400/30"
                      : "bg-surface-container-high border-white/10"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${isAi ? "text-indigo-400" : "text-white/40"}`}
                  >
                    {isAi ? "smart_toy" : "person"}
                  </span>
                </div>
                <div className={`max-w-[80%] ${!isAi ? "text-right" : ""}`}>
                  <div
                    className={`border p-4 rounded-2xl ${
                      isAi
                        ? "bg-surface-container-low border-white/5 rounded-tl-none"
                        : "bg-indigo-400/10 border-indigo-400/20 rounded-tr-none text-left"
                    }`}
                  >
                    <p className="text-body-md">{msg.content}</p>
                  </div>
                  <span
                    className={`text-[10px] text-neutral-500 mt-2 block ${isAi ? "ml-2" : "mr-2"}`}
                  >
                    {isAi ? "Sofia • AI Tutor" : "You • Just now"}
                  </span>
                </div>
              </div>
            );
          })}

          {isPending && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-400/20 flex items-center justify-center flex-shrink-0 border border-indigo-400/30">
                <span className="material-symbols-outlined text-indigo-400">smart_toy</span>
              </div>
              <div className="bg-surface-container-low border border-white/5 p-4 rounded-2xl rounded-tl-none">
                <span className="text-neutral-500 text-sm animate-pulse">Sofia is typing…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-6 left-8 right-8 bg-[#121217] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-neutral-400">
                Recording Focus Active
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3 p-2">
            <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
              <span className="material-symbols-outlined text-neutral-400">translate</span>
            </button>
            <div className="flex-grow relative">
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder-neutral-600 py-3 resize-none"
                placeholder="Reply in English…"
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>
            <button
              aria-label="send"
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
        <div className="bg-indigo-400/5 border border-indigo-400/10 p-4 rounded-xl mb-2">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase">Grounded AI</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Every response is strictly verified against your{" "}
            <strong>Knowledge Base</strong> documents.
          </p>
        </div>

        <div>
          <h3 className="text-on-surface font-bold text-base mb-4 flex items-center gap-2 font-manrope">
            <span className="material-symbols-outlined text-indigo-400">auto_awesome</span>
            Better Vocabulary
          </h3>

          {vocabulary.length > 0 ? (
            <div className="space-y-3">
              {vocabulary.map((word, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-low border border-white/5 p-4 rounded-xl hover:border-indigo-400/30 transition-all"
                >
                  <span className="text-indigo-400 font-bold">{word}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              Vocabulary suggestions will appear here after your first message.
            </p>
          )}
        </div>

        <div className="mt-auto bg-tertiary/5 border border-tertiary/10 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-tertiary text-sm">
              tips_and_updates
            </span>
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-tertiary">
              Grammar Hint
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Pay attention to verb tenses. Use past simple for completed actions:
            <br />
            <span className="text-tertiary">&ldquo;I went&rdquo; not &ldquo;I go&rdquo;</span>
          </p>
        </div>
      </aside>
    </div>
  );
}
