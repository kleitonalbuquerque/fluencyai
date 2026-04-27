type FeatureStateProps = {
  error: string | null;
  isLoading: boolean;
};

export function FeatureState({ error, isLoading }: FeatureStateProps) {
  if (isLoading) {
    return <p className="feature-state">Carregando...</p>;
  }

  if (error) {
    return (
      <div className="login-error" role="alert">
        {error}
      </div>
    );
  }

  return null;
}
