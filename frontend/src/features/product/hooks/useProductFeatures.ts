"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthenticatedResource } from "./useAuthenticatedResource";
import type {
  AiChatFeedback,
  CompleteLessonItemResult,
  CompleteLessonSectionResult,
  ImmersionSectionKey,
  RolePlayFeedback,
} from "../domain/types";
import {
  completeImmersionPlanItem,
  completeImmersionPlanSection,
  deleteKnowledgeSource,
  getDailyImmersionPlan,
  getLearningTracks,
  getImmersionPlanHistory,
  getGamificationSummary,
  getWeeklyImmersionPlan,
  getKnowledgeSource,
  getGlobalRanking,
  getKnowledgeSources,
  getMemorizationSession,
  getRolePlayScenarios,
  getSocialProgressShare,
  respondToRolePlay,
  sendAiMessage,
  setActiveLearningTrack,
  uncompleteImmersionPlanItem,
  uploadKnowledgeDocument,
} from "../services/productApi";
import { useAuthSession } from "@/features/app/hooks/useAuthSession";
import { updateStoredUser } from "@/features/auth/services/authSession";
import type { KnowledgeSourceDetail } from "../domain/types";

export function useDailyImmersionPlan() {
  return useAuthenticatedResource(getDailyImmersionPlan);
}

export function useWeeklyImmersionPlan(weekOffset = 0) {
  const loadWeeklyPlan = useCallback(
    (token: string) => getWeeklyImmersionPlan(token, weekOffset),
    [weekOffset],
  );
  return useAuthenticatedResource(loadWeeklyPlan);
}

export function useImmersionPlanHistory() {
  return useAuthenticatedResource(getImmersionPlanHistory);
}

export function useLearningTracks() {
  return useAuthenticatedResource(getLearningTracks);
}

export function useSetActiveLearningTrack() {
  const router = useRouter();
  const session = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function select(trackSlug: string): Promise<boolean> {
    if (!session) {
      router.replace("/login");
      return false;
    }

    setIsPending(true);
    setError(null);
    try {
      await setActiveLearningTrack(session.accessToken, trackSlug);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not switch track.");
      return false;
    } finally {
      setIsPending(false);
    }
  }

  return { error, isPending, select, session };
}

export function useCompleteImmersionSection() {
  const router = useRouter();
  const session = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function complete(
    day: number,
    section: ImmersionSectionKey,
  ): Promise<CompleteLessonSectionResult | null> {
    if (!session) {
      router.replace("/login");
      return null;
    }

    setIsPending(true);
    setError(null);
    try {
      const result = await completeImmersionPlanSection(
        session.accessToken,
        day,
        section,
      );
      updateStoredUser({
        ...session.user,
        xp: result.xp_total,
        level: result.level,
        streak: result.streak,
      });
      return result;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update progress.");
      return null;
    } finally {
      setIsPending(false);
    }
  }

  return { complete, error, isPending, session };
}

export function useCompleteImmersionItem() {
  const router = useRouter();
  const session = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function complete(
    day: number,
    section: ImmersionSectionKey,
    itemKey: string,
    answer?: string,
  ): Promise<CompleteLessonItemResult | null> {
    if (!session) {
      router.replace("/login");
      return null;
    }

    setIsPending(true);
    setError(null);
    try {
      const result = await completeImmersionPlanItem(
        session.accessToken,
        day,
        section,
        itemKey,
        answer,
      );
      updateStoredUser({
        ...session.user,
        xp: result.xp_total,
        level: result.level,
        streak: result.streak,
      });
      return result;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update progress.");
      return null;
    } finally {
      setIsPending(false);
    }
  }

  return { complete, error, isPending, session };
}

export function useUncompleteImmersionItem() {
  const router = useRouter();
  const session = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function uncomplete(
    day: number,
    section: ImmersionSectionKey,
    itemKey: string,
  ): Promise<CompleteLessonItemResult | null> {
    if (!session) {
      router.replace("/login");
      return null;
    }

    setIsPending(true);
    setError(null);
    try {
      const result = await uncompleteImmersionPlanItem(
        session.accessToken,
        day,
        section,
        itemKey,
      );
      updateStoredUser({
        ...session.user,
        xp: result.xp_total,
        level: result.level,
        streak: result.streak,
      });
      return result;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not undo progress.");
      return null;
    } finally {
      setIsPending(false);
    }
  }

  return { error, isPending, session, uncomplete };
}

export function useMemorizationSession() {
  return useAuthenticatedResource(getMemorizationSession);
}

export function useRolePlayScenarios() {
  return useAuthenticatedResource(getRolePlayScenarios);
}

export function useGamificationSummary() {
  return useAuthenticatedResource(getGamificationSummary);
}

export function useGlobalRanking() {
  return useAuthenticatedResource(getGlobalRanking);
}

export function useSocialProgressShare() {
  return useAuthenticatedResource(getSocialProgressShare);
}

export function useKnowledgeSources() {
  return useAuthenticatedResource(getKnowledgeSources);
}

export function useUploadKnowledgeDocument() {
  const router = useRouter();
  const session = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function upload(file: File): Promise<boolean> {
    if (!session) {
      router.replace("/login");
      return false;
    }

    setIsPending(true);
    setError(null);
    try {
      await uploadKnowledgeDocument(session.accessToken, file);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
      return false;
    } finally {
      setIsPending(false);
    }
  }

  return { error, isPending, upload };
}

export function useKnowledgeSourceActions() {
  const router = useRouter();
  const session = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSourceDetail | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);

  async function viewSource(sourceId: string): Promise<boolean> {
    if (!session) {
      router.replace("/login");
      return false;
    }

    setIsLoadingContent(true);
    setError(null);
    try {
      const source = await getKnowledgeSource(session.accessToken, sourceId);
      setSelectedSource(source);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load document content.");
      return false;
    } finally {
      setIsLoadingContent(false);
    }
  }

  async function deleteSource(sourceId: string): Promise<boolean> {
    if (!session) {
      router.replace("/login");
      return false;
    }

    setDeletingSourceId(sourceId);
    setError(null);
    try {
      await deleteKnowledgeSource(session.accessToken, sourceId);
      setSelectedSource((current) => (current?.id === sourceId ? null : current));
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete document.");
      return false;
    } finally {
      setDeletingSourceId(null);
    }
  }

  return {
    closeSource: () => setSelectedSource(null),
    deleteSource,
    deletingSourceId,
    error,
    isLoadingContent,
    selectedSource,
    viewSource,
  };
}

export function useAiConversation() {
  const router = useRouter();
  const session = useAuthSession();
  const [feedback, setFeedback] = useState<AiChatFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [router, session]);

  async function sendMessage(message: string): Promise<boolean> {
    if (!session) {
      router.replace("/login");
      return false;
    }

    setIsPending(true);
    setError(null);
    try {
      const response = await sendAiMessage(session.accessToken, message);
      setFeedback(response);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível responder.");
      return false;
    } finally {
      setIsPending(false);
    }
  }

  return { error, feedback, isPending, sendMessage, session };
}

export function useRolePlayResponse() {
  const router = useRouter();
  const session = useAuthSession();
  const [feedback, setFeedback] = useState<RolePlayFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [router, session]);

  async function sendResponse(scenario: string, message: string): Promise<boolean> {
    if (!session) {
      router.replace("/login");
      return false;
    }

    setIsPending(true);
    setError(null);
    try {
      const response = await respondToRolePlay(
        session.accessToken,
        scenario,
        message,
      );
      setFeedback(response);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível corrigir.");
      return false;
    } finally {
      setIsPending(false);
    }
  }

  return { error, feedback, isPending, sendResponse, session };
}
