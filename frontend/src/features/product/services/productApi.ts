import type {
  AiChatFeedback,
  DailyImmersionPlan,
  GamificationSummary,
  GlobalRanking,
  MemorizationSession,
  RolePlayFeedback,
  RolePlayScenarioList,
  SocialShare,
  KnowledgeSourceDetail,
  KnowledgeSourceList,
} from "../domain/types";
import { httpClient } from "@/services/http/client";

export function getDailyImmersionPlan(token: string): Promise<DailyImmersionPlan> {
  return httpClient.get<DailyImmersionPlan>("/learning-plan/today", { token });
}

export function sendAiMessage(
  token: string,
  message: string,
): Promise<AiChatFeedback> {
  return httpClient.post<AiChatFeedback>("/ai/chat", { message }, { token });
}

export function getMemorizationSession(token: string): Promise<MemorizationSession> {
  return httpClient.get<MemorizationSession>("/memorization/session", { token });
}

export function getRolePlayScenarios(token: string): Promise<RolePlayScenarioList> {
  return httpClient.get<RolePlayScenarioList>("/role-play/scenarios", { token });
}

export function respondToRolePlay(
  token: string,
  scenario: string,
  message: string,
): Promise<RolePlayFeedback> {
  return httpClient.post<RolePlayFeedback>(
    "/role-play/respond",
    { scenario, message },
    { token },
  );
}

export function getGamificationSummary(token: string): Promise<GamificationSummary> {
  return httpClient.get<GamificationSummary>("/gamification/summary", { token });
}

export function getGlobalRanking(token: string): Promise<GlobalRanking> {
  return httpClient.get<GlobalRanking>("/ranking/global", { token });
}

export function getSocialProgressShare(token: string): Promise<SocialShare> {
  return httpClient.get<SocialShare>("/social/share/progress", { token });
}

export function getKnowledgeSources(token: string): Promise<KnowledgeSourceList> {
  return httpClient.get<KnowledgeSourceList>("/knowledge/sources", { token });
}

export function getKnowledgeSource(
  token: string,
  sourceId: string,
): Promise<KnowledgeSourceDetail> {
  return httpClient.get<KnowledgeSourceDetail>(
    `/knowledge/sources/${encodeURIComponent(sourceId)}`,
    { token },
  );
}

export function uploadKnowledgeDocument(token: string, file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("file", file);
  
  return httpClient.post<{ message: string }>("/knowledge/upload", formData, { token });
}

export function deleteKnowledgeSource(token: string, sourceId: string): Promise<void> {
  return httpClient.delete<void>(
    `/knowledge/sources/${encodeURIComponent(sourceId)}`,
    { token },
  );
}
