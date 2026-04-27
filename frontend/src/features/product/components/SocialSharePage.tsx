"use client";

import { FeatureState } from "./FeatureState";
import { useSocialProgressShare } from "../hooks/useProductFeatures";

export function SocialSharePage() {
  const { data, error, isLoading } = useSocialProgressShare();

  return (
    <main className="max-w-4xl mx-auto px-8 py-12">
      <section className="mb-12 text-center md:text-left">
        <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500 block mb-2">Spread the Word</span>
        <h1 className="text-[32px] font-bold text-white mb-2 font-manrope">Share Your Progress</h1>
        <p className="text-neutral-400 text-lg">Celebrate your language learning journey with your network.</p>
      </section>

      <FeatureState error={error} isLoading={isLoading} />

      {data ? (
        <section className="p-8 rounded-2xl bg-surface-container border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <span className="material-symbols-outlined text-[120px]">share</span>
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="p-6 bg-[#121217] border border-white/10 rounded-xl">
              <p className="text-xl text-white font-medium leading-relaxed italic">
                "{data.share_text}"
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 text-sm text-neutral-500">
                {data.share_url}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                onClick={() => {
                  navigator.clipboard?.writeText(data.share_text);
                  alert("Message copied to clipboard!");
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">content_copy</span>
                Copy Message
              </button>
              <button
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
                onClick={() => {
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.share_text)}`;
                  window.open(twitterUrl, '_blank');
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">ios_share</span>
                Share on X
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
