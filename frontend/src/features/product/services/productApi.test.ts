import { afterEach, describe, expect, it, vi } from "vitest";

import {
  completeImmersionPlanItem,
  completeImmersionPlanSection,
  deleteKnowledgeSource,
  getImmersionPlanHistory,
  getImmersionPlanHistoryDay,
  getWeeklyImmersionPlan,
  getKnowledgeSource,
  uncompleteImmersionPlanItem,
  uploadKnowledgeDocument,
} from "./productApi";

describe("productApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads knowledge documents as FormData", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ message: "ok" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["# Rules"], "rules.md", { type: "text/markdown" });

    await uploadKnowledgeDocument("access-token", file);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/knowledge/upload",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
        headers: {
          Authorization: "Bearer access-token",
        },
      }),
    );
  });

  it("loads the weekly immersion plan", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        week_offset: 0,
        week_start_day: 1,
        week_end_day: 7,
        week_start_date: "2026-04-27",
        week_end_date: "2026-05-03",
        current_day: 1,
        days: [],
        focus: {},
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getWeeklyImmersionPlan("access-token", 1);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/learning-plan/weekly?week_offset=1",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("loads immersion plan history", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        entries: [
          {
            day: 1,
            title: "Essential Daily Conversations",
            is_current: true,
            is_completed: false,
            progress_percent: 20,
            completed_at: null,
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getImmersionPlanHistory("access-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/learning-plan/history",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("loads a history lesson day for review", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ day: 1 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getImmersionPlanHistoryDay("access-token", 1);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/learning-plan/history/day/1",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("marks an immersion section as complete", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        day: 1,
        section: "phrases",
        current_day: 1,
        lesson_completed: false,
        progress_percent: 20,
        sections: [],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await completeImmersionPlanSection("access-token", 1, "phrases");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/learning-plan/day/1/sections/phrases/complete",
      expect.objectContaining({
        method: "POST",
        body: "{}",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("marks an immersion item as complete", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        day: 1,
        section: "quiz",
        item_key: "1",
        xp_awarded: 5,
        xp_total: 125,
        level: 2,
        streak: 4,
        plan: {},
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await completeImmersionPlanItem("access-token", 1, "quiz", "1", "Hello");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/learning-plan/day/1/items/quiz/1/complete",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ answer: "Hello" }),
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("undoes an immersion item completion", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        day: 1,
        section: "vocabulary",
        item_key: "1",
        xp_awarded: -3,
        xp_total: 119,
        level: 2,
        streak: 4,
        plan: {},
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await uncompleteImmersionPlanItem("access-token", 1, "vocabulary", "1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/learning-plan/day/1/items/vocabulary/1/complete",
      expect.objectContaining({
        method: "DELETE",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("loads a knowledge source by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: "rules.md",
        name: "rules.md",
        type: "markdown",
        last_updated: "2026-04-27T00:00:00Z",
        content: "# Rules",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getKnowledgeSource("access-token", "rules.md");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/knowledge/sources/rules.md",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("deletes a knowledge source by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new Error("No body")),
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteKnowledgeSource("access-token", "rules.md");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/knowledge/sources/rules.md",
      expect.objectContaining({
        method: "DELETE",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });
});
