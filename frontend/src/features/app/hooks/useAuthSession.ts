"use client";

import { useEffect, useState } from "react";

import type { AuthSession } from "@/features/auth/services/authSession";
import { getAuthSession } from "@/features/auth/services/authSession";

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());

  useEffect(() => {
    setSession(getAuthSession());
  }, []);

  return session;
}
