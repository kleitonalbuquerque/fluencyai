"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthSession } from "@/features/app/hooks/useAuthSession";
import type { AuthSession } from "@/features/auth/services/authSession";

type ResourceState<TResource> = {
  data: TResource | null;
  error: string | null;
  isLoading: boolean;
  session: AuthSession | null;
  mutate: () => void;
};

export function useAuthenticatedResource<TResource>(
  loadResource: (token: string) => Promise<TResource>,
): ResourceState<TResource> {
  const router = useRouter();
  const session = useAuthSession();
  const token = session?.accessToken ?? null;
  const [data, setData] = useState<TResource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const mutate = () => setVersion((v) => v + 1);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    loadResource(token)
      .then((resource) => {
        if (isCurrent) {
          setData(resource);
        }
      })
      .catch((cause) => {
        if (isCurrent) {
          setError(cause instanceof Error ? cause.message : "Não foi possível carregar.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [loadResource, router, token, version]);

  return { data, error, isLoading, session, mutate };
}
