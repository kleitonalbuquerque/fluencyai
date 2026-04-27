import type {
  AiChatFeedback,
  DailyImmersionPlan,
  GamificationSummary,
  GlobalRanking,
  MemorizationSession,
  RolePlayFeedback,
  RolePlayScenarioList,
  SocialShare,
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
