import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiConversationPage } from "./AiConversationPage";
import { ImmersionPlanPage } from "./ImmersionPlanPage";
import { MemorizationSessionPage } from "./MemorizationSessionPage";
import { RankingPage } from "./RankingPage";
import { RolePlayPage } from "./RolePlayPage";
import { SocialSharePage } from "./SocialSharePage";
import { START_LESSON_STORAGE_KEY } from "../domain/immersionStart";
import type { DailyImmersionPlanWithProgress, WeeklyImmersionPlan } from "../domain/types";
import {
  completeImmersionPlanItem,
  completeImmersionPlanSection,
  getDailyImmersionPlan,
  getImmersionPlanDay,
  getImmersionPlanHistory,
  getImmersionPlanHistoryDay,
  getLearningTracks,
  deleteKnowledgeSource,
  getGamificationSummary,
  getGlobalRanking,
  getKnowledgeSource,
  getMemorizationSession,
  getRolePlayScenarios,
  getSocialProgressShare,
  getWeeklyImmersionPlan,
  respondToRolePlay,
  sendAiMessage,
  setActiveLearningTrack,
  uncompleteImmersionPlanItem,
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
  completeImmersionPlanItem: vi.fn(),
  completeImmersionPlanSection: vi.fn(),
  getDailyImmersionPlan: vi.fn(),
  getImmersionPlanDay: vi.fn(),
  getImmersionPlanHistory: vi.fn(),
  getImmersionPlanHistoryDay: vi.fn(),
  getLearningTracks: vi.fn(),
  deleteKnowledgeSource: vi.fn(),
  getGamificationSummary: vi.fn(),
  getGlobalRanking: vi.fn(),
  getKnowledgeSource: vi.fn(),
  getMemorizationSession: vi.fn(),
  getRolePlayScenarios: vi.fn(),
  getSocialProgressShare: vi.fn(),
  getWeeklyImmersionPlan: vi.fn(),
  respondToRolePlay: vi.fn(),
  sendAiMessage: vi.fn(),
  setActiveLearningTrack: vi.fn(),
  uncompleteImmersionPlanItem: vi.fn(),
}));

const phrase = { text: "Could you repeat that?", translation: "Pode repetir?", position: 1 };
const word = {
  word: "reservation",
  theme: "viagem",
  definition: "reserva",
  example_sentence: "I have a reservation.",
  memory_tip: "Reserve um lugar na memória.",
  position: 1,
};

describe("product feature pages", () => {
  let defaultImmersionPlan: DailyImmersionPlanWithProgress;

  beforeEach(() => {
    router.replace.mockReset();
    window.sessionStorage.clear();
    const immersionPlan: DailyImmersionPlanWithProgress = {
      day: 1,
      track_slug: "study",
      track_label: "Study",
      title: "Imersão essencial",
      essential_phrases: Array.from({ length: 20 }, (_, index) => ({
        ...phrase,
        position: index + 1,
        item_key: String(index + 1),
        is_completed: false,
        xp_awarded: 0,
        completed_at: null,
      })),
      vocabulary_words: Array.from({ length: 15 }, (_, index) => ({
        ...word,
        position: index + 1,
        item_key: String(index + 1),
        is_completed: false,
        xp_awarded: 0,
        completed_at: null,
      })),
      grammar_points: [
        {
          title: "Simple present",
          explanation: "Use para hábitos.",
          example: "I practice daily.",
          position: 1,
          item_key: "1",
          is_completed: false,
          xp_awarded: 0,
          completed_at: null,
        },
      ],
      grammar_practice_items: [
        {
          title: "Verb to be",
          prompt: "Choose the correct sentence.",
          options: ["I am ready.", "I are ready."],
          answer: "I am ready.",
          explanation: "Use am with I.",
          position: 1,
          item_key: "1",
          is_completed: false,
          selected_answer: null,
          is_correct: null,
          xp_awarded: 0,
          completed_at: null,
        },
      ],
      speaking_exercise: "Leia uma apresentação em voz alta.",
      speaking_practice: {
        prompt: "Leia uma apresentação em voz alta.",
        item_key: "practice",
        is_completed: false,
        answer: null,
        score: null,
        feedback: null,
        xp_awarded: 0,
        completed_at: null,
      },
      quiz: {
        title: "Quiz final",
        questions: [
          {
            prompt: "Como pedir para repetir?",
            options: ["Could you repeat that?"],
            answer: "Could you repeat that?",
            position: 1,
            item_key: "1",
            is_completed: false,
            selected_answer: null,
            is_correct: null,
            xp_awarded: 0,
            completed_at: null,
          },
        ],
      },
      progress_percent: 0,
      sections: [
        {
          section: "phrases",
          label: "Essential Phrases",
          is_completed: false,
          item_count: 20,
          completed_count: 0,
          completed_at: null,
        },
        {
          section: "vocabulary",
          label: "Thematic Vocabulary",
          is_completed: false,
          item_count: 15,
          completed_count: 0,
          completed_at: null,
        },
        {
          section: "grammar" as const,
          label: "Grammar Points",
          is_completed: false,
          item_count: 1,
          completed_count: 0,
          completed_at: null,
        },
        {
          section: "speaking" as const,
          label: "Speaking Exercise",
          is_completed: false,
          item_count: 1,
          completed_count: 0,
          completed_at: null,
        },
        {
          section: "grammar_practice" as const,
          label: "Verb & Structure Practice",
          is_completed: false,
          item_count: 1,
          completed_count: 0,
          completed_at: null,
        },
        {
          section: "quiz" as const,
          label: "Final Quiz",
          is_completed: false,
          item_count: 1,
          completed_count: 0,
          completed_at: null,
        },
      ],
      items: [
        ...Array.from({ length: 20 }, (_, index) => ({
          section: "phrases" as const,
          item_key: String(index + 1),
          is_completed: false,
          xp_awarded: 0,
          answer: null,
          is_correct: null,
          score: null,
          feedback: null,
          completed_at: null,
        })),
        ...Array.from({ length: 15 }, (_, index) => ({
          section: "vocabulary" as const,
          item_key: String(index + 1),
          is_completed: false,
          xp_awarded: 0,
          answer: null,
          is_correct: null,
          score: null,
          feedback: null,
          completed_at: null,
        })),
        {
          section: "grammar",
          item_key: "1",
          is_completed: false,
          xp_awarded: 0,
          answer: null,
          is_correct: null,
          score: null,
          feedback: null,
          completed_at: null,
        },
        {
          section: "grammar_practice",
          item_key: "1",
          is_completed: false,
          xp_awarded: 0,
          answer: null,
          is_correct: null,
          score: null,
          feedback: null,
          completed_at: null,
        },
        {
          section: "speaking",
          item_key: "practice",
          is_completed: false,
          xp_awarded: 0,
          answer: null,
          is_correct: null,
          score: null,
          feedback: null,
          completed_at: null,
        },
        {
          section: "quiz",
          item_key: "1",
          is_completed: false,
          xp_awarded: 0,
          answer: null,
          is_correct: null,
          score: null,
          feedback: null,
          completed_at: null,
        },
      ],
    };
    defaultImmersionPlan = immersionPlan;
    const reviewedPhrasePlan: DailyImmersionPlanWithProgress = {
      ...immersionPlan,
      essential_phrases: immersionPlan.essential_phrases.map((item, index) => ({
        ...item,
        is_completed: index === 0,
        xp_awarded: index === 0 ? 2 : 0,
      })),
      sections: immersionPlan.sections.map((section) => (
        section.section === "phrases" ? { ...section, completed_count: 1 } : section
      )),
      items: immersionPlan.items.map((item) => (
        item.section === "phrases" && item.item_key === "1"
          ? { ...item, is_completed: true, xp_awarded: 2 }
          : item
      )),
    };
    vi.mocked(getDailyImmersionPlan).mockResolvedValue(immersionPlan);
    vi.mocked(getImmersionPlanDay).mockResolvedValue(immersionPlan);
    vi.mocked(getLearningTracks).mockResolvedValue([
      {
        slug: "study",
        label: "Study",
        description: "Study track",
        position: 1,
      },
    ]);
    vi.mocked(setActiveLearningTrack).mockResolvedValue({
      slug: "study",
      label: "Study",
      description: "Study track",
      position: 1,
    });
    vi.mocked(getImmersionPlanHistory).mockResolvedValue({
      track: {
        slug: "study",
        label: "Study",
        description: "Study track",
        position: 1,
      },
      entries: [
        {
          day: 1,
          title: "Imersão essencial",
          track_slug: "study",
          track_label: "Study",
          is_current: true,
          is_completed: false,
          progress_percent: 0,
          completed_at: null,
        },
      ],
    });
    vi.mocked(getImmersionPlanHistoryDay).mockResolvedValue(reviewedPhrasePlan);
    vi.mocked(getWeeklyImmersionPlan).mockResolvedValue({
      track: {
        slug: "study",
        label: "Study",
        description: "Study track",
        position: 1,
      },
      week_offset: 0,
      week_start_day: 1,
      week_end_day: 7,
      week_start_date: "2026-04-27",
      week_end_date: "2026-05-03",
      current_day: 1,
      days: [
        {
          day: 1,
          weekday_label: "MON",
          calendar_date: "2026-04-27",
          calendar_day: 27,
          title: "Imersão essencial",
          is_current: true,
          is_locked: false,
          is_completed: false,
          has_lesson: true,
          progress_percent: 0,
        },
        ...[2, 3, 4, 5, 6, 7].map((day) => ({
          day,
          weekday_label: ["TUE", "WED", "THU", "FRI", "SAT", "SUN"][day - 2],
          calendar_date: [
            "2026-04-28",
            "2026-04-29",
            "2026-04-30",
            "2026-05-01",
            "2026-05-02",
            "2026-05-03",
          ][day - 2],
          calendar_day: [28, 29, 30, 1, 2, 3][day - 2],
          title: `Day ${day}`,
          is_current: false,
          is_locked: true,
          is_completed: false,
          has_lesson: false,
          progress_percent: 0,
        })),
      ],
      focus: immersionPlan,
    });
    vi.mocked(completeImmersionPlanSection).mockResolvedValue({
      day: 1,
      track_slug: "study",
      section: "phrases",
      current_day: 1,
      lesson_completed: false,
      progress_percent: 17,
      sections: immersionPlan.sections.map((section) => ({
        ...section,
        is_completed: section.section === "phrases",
        completed_count: section.section === "phrases" ? 20 : section.completed_count,
      })),
      items: reviewedPhrasePlan.items,
      xp_awarded: 10,
      xp_total: 132,
      level: 2,
      streak: 4,
    });
    vi.mocked(completeImmersionPlanItem).mockResolvedValue({
      day: 1,
      track_slug: "study",
      section: "phrases",
      item_key: "1",
      xp_awarded: 2,
      xp_total: 122,
      level: 2,
      streak: 4,
      plan: reviewedPhrasePlan,
    });
    vi.mocked(uncompleteImmersionPlanItem).mockResolvedValue({
      day: 1,
      track_slug: "study",
      section: "phrases",
      item_key: "1",
      xp_awarded: -2,
      xp_total: 120,
      level: 2,
      streak: 4,
      plan: immersionPlan,
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
    vi.mocked(getKnowledgeSource).mockResolvedValue({
      id: "rules.md",
      name: "rules.md",
      type: "markdown",
      last_updated: "2026-04-27T00:00:00Z",
      content: "# Rules",
    });
    vi.mocked(deleteKnowledgeSource).mockResolvedValue(undefined);
    vi.mocked(getSocialProgressShare).mockResolvedValue({
      share_text: "Estou praticando no FluencyAI.",
      share_url: "http://localhost:3000/app",
    });
  });

  it("renders the 7 day immersion plan blocks", async () => {
    render(<ImmersionPlanPage />);

    expect(await screen.findAllByText("Imersão essencial")).toHaveLength(2);
    expect(screen.getByText("Lesson History")).toBeInTheDocument();
    expect(screen.getByText("20 Phrases")).toBeInTheDocument();
    expect(screen.getByText("15 Words")).toBeInTheDocument();
    expect(screen.getByText("Quiz final")).toBeInTheDocument();
  });

  it("shows roadmap progress markers for the selected track", async () => {
    const travelPlan: DailyImmersionPlanWithProgress = {
      ...defaultImmersionPlan,
      track_slug: "travel",
      track_label: "Travel",
      progress_percent: 40,
    };
    const travelWeeklyPlan: WeeklyImmersionPlan = {
      track: {
        slug: "travel",
        label: "Travel",
        description: "Travel track",
        position: 2,
      },
      week_offset: 0,
      week_start_day: 1,
      week_end_day: 7,
      week_start_date: "2026-04-27",
      week_end_date: "2026-05-03",
      current_day: 1,
      days: [
        {
          day: 1,
          weekday_label: "MON",
          calendar_date: "2026-04-27",
          calendar_day: 27,
          title: "Travel day 1",
          is_current: true,
          is_locked: false,
          is_completed: false,
          has_lesson: true,
          progress_percent: 40,
        },
        {
          day: 2,
          weekday_label: "TUE",
          calendar_date: "2026-04-28",
          calendar_day: 28,
          title: "Travel day 2",
          is_current: false,
          is_locked: false,
          is_completed: true,
          has_lesson: true,
          progress_percent: 100,
        },
        ...[3, 4, 5, 6, 7].map((day) => ({
          day,
          weekday_label: ["WED", "THU", "FRI", "SAT", "SUN"][day - 3],
          calendar_date: [
            "2026-04-29",
            "2026-04-30",
            "2026-05-01",
            "2026-05-02",
            "2026-05-03",
          ][day - 3],
          calendar_day: [29, 30, 1, 2, 3][day - 3],
          title: `Travel day ${day}`,
          is_current: false,
          is_locked: true,
          is_completed: false,
          has_lesson: false,
          progress_percent: 0,
        })),
      ],
      focus: travelPlan,
    };
    vi.mocked(getLearningTracks).mockResolvedValue([
      {
        slug: "study",
        label: "Study",
        description: "Study track",
        position: 1,
      },
      {
        slug: "travel",
        label: "Travel",
        description: "Travel track",
        position: 2,
      },
    ]);
    vi.mocked(getWeeklyImmersionPlan).mockResolvedValue(travelWeeklyPlan);
    vi.mocked(getImmersionPlanHistory).mockResolvedValue({
      track: travelWeeklyPlan.track,
      entries: [],
    });

    render(<ImmersionPlanPage />);

    const partialDay = await screen.findByRole("button", {
      name: "Travel, MON 27, 40% complete",
    });
    const completedDay = screen.getByRole("button", {
      name: "Travel, TUE 28, 100% complete",
    });

    expect(partialDay).toHaveTextContent("40%");
    expect(completedDay).toHaveTextContent("Complete");
    expect(completedDay).toHaveTextContent("check_circle");
  });

  it("opens an immersion section and persists item review", async () => {
    const user = userEvent.setup();
    render(<ImmersionPlanPage />);

    await screen.findAllByText("Imersão essencial");
    await user.click(screen.getAllByRole("button", { name: /Review list/i })[0]);

    expect(await screen.findAllByText("Could you repeat that?")).toHaveLength(20);
    await user.click(screen.getAllByRole("button", { name: /Could you repeat that/i })[0]);

    expect(completeImmersionPlanItem).toHaveBeenCalledWith(
      "access-token",
      1,
      "phrases",
      "1",
      undefined,
    );

    await user.click(screen.getAllByRole("button", { name: /Could you repeat that/i })[0]);

    expect(uncompleteImmersionPlanItem).toHaveBeenCalledWith(
      "access-token",
      1,
      "phrases",
      "1",
    );
  });

  it("opens the next lesson section from the start lesson event", async () => {
    window.sessionStorage.setItem(START_LESSON_STORAGE_KEY, "1");
    render(<ImmersionPlanPage />);

    expect(await screen.findAllByText("Could you repeat that?")).toHaveLength(20);
    expect(window.sessionStorage.getItem(START_LESSON_STORAGE_KEY)).toBeNull();
  });

  it("loads a history lesson for review", async () => {
    const user = userEvent.setup();
    render(<ImmersionPlanPage />);

    await screen.findByText("Lesson History");
    await user.click(screen.getByRole("button", { name: /Day 1 Imersão essencial/i }));

    await waitFor(() => {
      expect(getImmersionPlanHistoryDay).toHaveBeenCalledWith("access-token", 1);
    });
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

    expect(await screen.findByText(/"Estou praticando no FluencyAI."/)).toBeInTheDocument();
    expect(screen.getByText("http://localhost:3000/app")).toBeInTheDocument();
  });
});
