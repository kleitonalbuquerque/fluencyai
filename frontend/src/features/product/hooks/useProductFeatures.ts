"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthenticatedResource } from "./useAuthenticatedResource";
import type { AiChatFeedback, RolePlayFeedback } from "../domain/types";
import {
  getDailyImmersionPlan,
  getGamificationSummary,
  getGlobalRanking,
  getKnowledgeSources,
  getMemorizationSession,
  getRolePlayScenarios,
  getSocialProgressShare,
  respondToRolePlay,
  sendAiMessage,
  uploadKnowledgeDocument,
} from "../services/productApi";
import { useAuthSession } from "@/features/app/hooks/useAuthSession";

export function useDailyImmersionPlan() {
  return useAuthenticatedResource(getDailyImmersionPlan);
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
