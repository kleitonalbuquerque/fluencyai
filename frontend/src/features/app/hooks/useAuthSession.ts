"use client";

import { useEffect, useState } from "react";

import type { AuthSession } from "@/features/auth/services/authSession";
import { getAuthSession, updateStoredUser } from "@/features/auth/services/authSession";
import { getCurrentUser } from "@/features/auth/services/authApi";

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());

  useEffect(() => {
    const currentSession = getAuthSession();
    setSession(currentSession);

    if (currentSession) {
      // Sync user profile from backend to get latest permissions/stats
      getCurrentUser(currentSession.accessToken)
        .then((freshUser) => {
          updateStoredUser(freshUser);
          setSession(getAuthSession());
        })
        .catch(() => {
          // If token is invalid or expired, clearSession would be handled elsewhere
          // or we just keep the stale local session for now
        });
    }
  }, []);

  return session;
}
