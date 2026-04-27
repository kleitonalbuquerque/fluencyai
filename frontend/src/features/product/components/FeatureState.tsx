type FeatureStateProps = {
  error: string | null;
  isLoading: boolean;
};

export function FeatureState({ error, isLoading }: FeatureStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-neutral-400 font-medium animate-pulse">Loading experience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium my-6" role="alert">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span className="font-bold uppercase tracking-wider text-[10px]">Error occurred</span>
        </div>
        {error}
      </div>
    );
  }

  return null;
}
