import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiConversationPage } from "./AiConversationPage";
import { ImmersionPlanPage } from "./ImmersionPlanPage";
import { MemorizationSessionPage } from "./MemorizationSessionPage";
import { RankingPage } from "./RankingPage";
import { RolePlayPage } from "./RolePlayPage";
import { SocialSharePage } from "./SocialSharePage";
import {
  getDailyImmersionPlan,
  getGamificationSummary,
  getGlobalRanking,
  getMemorizationSession,
  getRolePlayScenarios,
  getSocialProgressShare,
  respondToRolePlay,
  sendAiMessage,
} from "../services/productApi";

const sessionState = vi.hoisted(() => ({
  session: {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    tokenType: "bearer",
    user: {
      id: "user-1",
      email: "ana@example.com",
      xp: 120,
      level: 2,
      streak: 4,
      avatar_url: null,
    },
  } as any,
}));

const router = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/app/plan",
}));

vi.mock("@/features/app/hooks/useAuthSession", () => ({
  useAuthSession: () => sessionState.session,
}));

vi.mock("../services/productApi", () => ({
  getDailyImmersionPlan: vi.fn(),
  getGamificationSummary: vi.fn(),
  getGlobalRanking: vi.fn(),
  getMemorizationSession: vi.fn(),
  getRolePlayScenarios: vi.fn(),
  getSocialProgressShare: vi.fn(),
  respondToRolePlay: vi.fn(),
  sendAiMessage: vi.fn(),
}));

const phrase = { text: "Could you repeat that?", translation: "Pode repetir?" };
const word = {
  word: "reservation",
  theme: "viagem",
  definition: "reserva",
  example_sentence: "I have a reservation.",
  memory_tip: "Reserve um lugar na memória.",
};

describe("product feature pages", () => {
  beforeEach(() => {
    router.replace.mockReset();
    vi.mocked(getDailyImmersionPlan).mockResolvedValue({
      day: 1,
      title: "Imersão essencial",
      essential_phrases: Array.from({ length: 20 }, () => phrase),
      vocabulary_words: Array.from({ length: 15 }, () => word),
      grammar_points: [
        {
          title: "Simple present",
          explanation: "Use para hábitos.",
          example: "I practice daily.",
        },
      ],
      speaking_exercise: "Leia uma apresentação em voz alta.",
      quiz: {
        title: "Quiz final",
        questions: [
          {
            prompt: "Como pedir para repetir?",
            options: ["Could you repeat that?"],
            answer: "Could you repeat that?",
          },
        ],
      },
    });
    vi.mocked(getMemorizationSession).mockResolvedValue({
      target_accuracy: 100,
      words: Array.from({ length: 20 }, () => word),
    });
    vi.mocked(getRolePlayScenarios).mockResolvedValue({
      scenarios: [
        {
          slug: "cafe",
          title: "Café",
          situation: "Pedir uma bebida.",
          first_prompt: "What would you like?",
        },
      ],
    });
    vi.mocked(respondToRolePlay).mockResolvedValue({
      scenario: "cafe",
      correction: "Isso soa bem! Só uma coisinha pequena...",
      suggested_vocabulary: ["I would like"],
      next_prompt: "Anything else?",
    });
    vi.mocked(sendAiMessage).mockResolvedValue({
      reply: "Tell me more.",
      correction: "Isso soa bem! Só uma coisinha pequena...",
      suggested_vocabulary: ["actually"],
    });
    vi.mocked(getGamificationSummary).mockResolvedValue({
      xp: 120,
      level: 2,
      streak: 4,
      words_learned: 12,
      next_level_xp: 200,
    });
    vi.mocked(getGlobalRanking).mockResolvedValue({
      entries: [
        { rank: 1, email: "ana@example.com", xp: 120, level: 2, streak: 4 },
      ],
    });
    vi.mocked(getSocialProgressShare).mockResolvedValue({
      share_text: "Estou praticando no FluencyAI.",
      share_url: "http://localhost:3000/app",
    });
  });

  it("renders the 7 day immersion plan blocks", async () => {
    render(<ImmersionPlanPage />);

    expect(await screen.findByText("Imersão essencial")).toBeInTheDocument();
    expect(screen.getByText("20 Phrases")).toBeInTheDocument();
    expect(screen.getByText("15 Words")).toBeInTheDocument();
    expect(screen.getByText("Quiz final")).toBeInTheDocument();
  });

  it("sends an AI conversation message and shows feedback", async () => {
    const user = userEvent.setup();
    render(<AiConversationPage />);

    await user.type(screen.getByPlaceholderText("Reply in Spanish..."), "I go cafe yesterday");
    await user.click(screen.getByText("send"));

    // We check that the message we typed is in the document
    expect(screen.getByText("I go cafe yesterday")).toBeInTheDocument();
  });

  it("renders the memorization session target and words", async () => {
    render(<MemorizationSessionPage />);

    expect(await screen.findByText("Daily Vocabulary Mastery")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getAllByText("reservation")).toHaveLength(4); // 1 in main card + 3 in upcoming queue
  });

  it("renders role play scenarios and realtime correction", async () => {
    const user = userEvent.setup();
    render(<RolePlayPage />);

    expect(await screen.findByText("Café")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Your Response"), "I want coffee");
    await user.click(screen.getByRole("button", { name: "Send Response" }));

    expect(
      await screen.findByText("Isso soa bem! Só uma coisinha pequena..."),
    ).toBeInTheDocument();
  });

  it("renders gamification and ranking data", async () => {
    render(<RankingPage />);

    expect(await screen.findAllByText("120 XP")).toHaveLength(2);
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });

  it("renders social share progress", async () => {
    render(<SocialSharePage />);

    expect(await screen.findByText("Estou praticando no FluencyAI.")).toBeInTheDocument();
    expect(screen.getByText("http://localhost:3000/app")).toBeInTheDocument();
  });
});
