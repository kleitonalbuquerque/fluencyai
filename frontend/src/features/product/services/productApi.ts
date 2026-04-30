import type {
  AiChatFeedback,
  CompleteLessonItemResult,
  CompleteLessonSectionResult,
  DailyImmersionPlan,
  DailyImmersionPlanWithProgress,
  GamificationSummary,
  GlobalRanking,
  ImmersionSectionKey,
  LessonHistory,
  MemorizationSession,
  RolePlayFeedback,
  RolePlayScenarioList,
  SocialShare,
  KnowledgeSourceDetail,
  KnowledgeSourceList,
  LearningTrack,
  WeeklyImmersionPlan,
} from "../domain/types";
import { httpClient } from "@/services/http/client";

export function getLearningTracks(token: string): Promise<LearningTrack[]> {
  return httpClient.get<LearningTrack[]>("/learning-tracks", { token });
}

export function getActiveLearningTrack(token: string): Promise<LearningTrack> {
  return httpClient.get<LearningTrack>("/learning-tracks/active", { token });
}

export function setActiveLearningTrack(
  token: string,
  trackSlug: string,
): Promise<LearningTrack> {
  return httpClient.put<LearningTrack>(
    "/learning-tracks/active",
    { track_slug: trackSlug },
    { token },
  );
}

export function getDailyImmersionPlan(token: string): Promise<DailyImmersionPlan> {
  return httpClient.get<DailyImmersionPlan>("/learning-plan/today", { token });
}

export function getWeeklyImmersionPlan(
  token: string,
  weekOffset = 0,
): Promise<WeeklyImmersionPlan> {
  return httpClient.get<WeeklyImmersionPlan>(
    `/learning-plan/weekly?week_offset=${weekOffset}`,
    { token },
  );
}

export function getImmersionPlanDay(
  token: string,
  day: number,
): Promise<DailyImmersionPlanWithProgress> {
  return httpClient.get<DailyImmersionPlanWithProgress>(
    `/learning-plan/day/${day}`,
    { token },
  );
}

export function getImmersionPlanHistory(token: string): Promise<LessonHistory> {
  return httpClient.get<LessonHistory>("/learning-plan/history", { token });
}

export function getImmersionPlanHistoryDay(
  token: string,
  day: number,
): Promise<DailyImmersionPlanWithProgress> {
  return httpClient.get<DailyImmersionPlanWithProgress>(
    `/learning-plan/history/day/${day}`,
    { token },
  );
}

export function completeImmersionPlanSection(
  token: string,
  day: number,
  section: ImmersionSectionKey,
): Promise<CompleteLessonSectionResult> {
  return httpClient.post<CompleteLessonSectionResult>(
    `/learning-plan/day/${day}/sections/${section}/complete`,
    {},
    { token },
  );
}

export function completeImmersionPlanItem(
  token: string,
  day: number,
  section: ImmersionSectionKey,
  itemKey: string,
  answer?: string,
): Promise<CompleteLessonItemResult> {
  return httpClient.post<CompleteLessonItemResult>(
    `/learning-plan/day/${day}/items/${section}/${encodeURIComponent(itemKey)}/complete`,
    { answer: answer ?? null },
    { token },
  );
}

export function uncompleteImmersionPlanItem(
  token: string,
  day: number,
  section: ImmersionSectionKey,
  itemKey: string,
): Promise<CompleteLessonItemResult> {
  return httpClient.delete<CompleteLessonItemResult>(
    `/learning-plan/day/${day}/items/${section}/${encodeURIComponent(itemKey)}/complete`,
    { token },
  );
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
