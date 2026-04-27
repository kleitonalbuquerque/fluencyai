"use client";

import { ChangeEvent, useRef } from "react";
import { FeatureState } from "./FeatureState";
import { useKnowledgeSources, useUploadKnowledgeDocument } from "../hooks/useProductFeatures";
import { KnowledgeSource } from "../domain/types";

export function KnowledgeBasePage() {
  const { data, error, isLoading, session, mutate } = useKnowledgeSources();
  const { upload, isPending: isUploading, error: uploadError } = useUploadKnowledgeDocument();
  const isAdmin = session?.user?.is_admin;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await upload(file);
      if (success) {
        mutate(); // Refresh list
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-8 py-12">
      <header className="mb-12">
        <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500 block mb-2">Internal Learning Brain</span>
        <h1 className="text-[32px] font-bold text-white mb-2 font-manrope">Knowledge Base</h1>
        <p className="text-neutral-400 text-lg">The AI consults these documents to provide accurate, grounded answers.</p>
      </header>

      <FeatureState error={error || uploadError} isLoading={isLoading} />

      {data ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.sources.map((src: KnowledgeSource) => (
            <article 
              key={src.id}
              className="p-6 rounded-2xl bg-surface-container border border-white/5 hover:border-primary/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${
                  src.type === "markdown" ? "bg-indigo-400/10 text-indigo-400" : "bg-tertiary/10 text-tertiary"
                }`}>
                  <span className="material-symbols-outlined">
                    {src.type === "markdown" ? "description" : "picture_as_pdf"}
                  </span>
                </div>
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-neutral-500 bg-white/5 px-2 py-0.5 rounded">
                  {src.type}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors truncate" title={src.name}>
                {src.name}
              </h3>
              <p className="text-xs text-neutral-500 mb-6">
                Last updated: {new Date(src.last_updated).toLocaleDateString()}
              </p>

              <div className="flex items-center gap-2 text-primary font-bold text-xs cursor-pointer hover:underline">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                View Content
              </div>
            </article>
          ))}

          {/* Add New Source - ONLY FOR ADMIN */}
          {isAdmin && (
            <div className="relative">
              <input
                type="file"
                accept=".md,.pdf"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                disabled={isUploading}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-full p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/20 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center gap-3 group text-neutral-500 hover:text-neutral-300 disabled:opacity-50"
              >
                <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors ${isUploading ? 'animate-pulse' : ''}`}>
                  <span className="material-symbols-outlined">{isUploading ? 'sync' : 'add'}</span>
                </div>
                <span className="font-bold text-sm">{isUploading ? 'Uploading...' : 'Add New Document'}</span>
              </button>
            </div>
          )}
        </section>
      ) : null}

      {!isLoading && data?.sources.length === 0 && (
        <div className="text-center py-20 bg-surface-container/50 rounded-3xl border border-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-neutral-600">database_off</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No documents found</h2>
          <p className="text-neutral-500 max-w-md mx-auto">
            Your knowledge base is empty. 
            {isAdmin ? " Add Markdown files or PDFs to get started." : " Contact an administrator to populate the brain."}
          </p>
        </div>
      )}
    </main>
  );
}
