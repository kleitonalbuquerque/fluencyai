"use client";

import { useEffect, useState } from "react";

import type { AuthSession } from "@/features/auth/services/authSession";
import {
  AUTH_SESSION_UPDATED_EVENT,
  getAuthSession,
  updateStoredUser,
} from "@/features/auth/services/authSession";
import { getCurrentUser } from "@/features/auth/services/authApi";

let profileSyncPromise: Promise<void> | null = null;
let profileSyncToken: string | null = null;

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());

  useEffect(() => {
    function syncSession() {
      setSession(getAuthSession());
    }

    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, syncSession);
    const currentSession = getAuthSession();
    setSession(currentSession);

    let isMounted = true;

    if (
      currentSession &&
      (!profileSyncPromise || profileSyncToken !== currentSession.accessToken)
    ) {
      profileSyncToken = currentSession.accessToken;
      profileSyncPromise = getCurrentUser(currentSession.accessToken)
        .then((freshUser) => {
          const latestSession = getAuthSession();
          if (!latestSession || latestSession.accessToken !== currentSession.accessToken) {
            return;
          }

          if (!areUsersEqual(currentSession.user, freshUser)) {
            updateStoredUser(freshUser);
          }

          if (isMounted) {
            setSession(getAuthSession());
          }
        })
        .catch(() => {
          profileSyncToken = null;
        })
        .finally(() => {
          if (profileSyncToken === currentSession.accessToken) {
            profileSyncPromise = null;
            profileSyncToken = null;
          }
        });
    } else if (profileSyncPromise) {
      profileSyncPromise.finally(() => {
        if (isMounted) {
          setSession(getAuthSession());
        }
      });
    }

    return () => {
      isMounted = false;
      window.removeEventListener(AUTH_SESSION_UPDATED_EVENT, syncSession);
    };
  }, []);

  return session;
}

function areUsersEqual(
  current: AuthSession["user"],
  next: AuthSession["user"],
) {
  return (
    current.id === next.id &&
    current.email === next.email &&
    current.xp === next.xp &&
    current.level === next.level &&
    current.streak === next.streak &&
    current.is_admin === next.is_admin &&
    current.avatar_url === next.avatar_url
  );
}
