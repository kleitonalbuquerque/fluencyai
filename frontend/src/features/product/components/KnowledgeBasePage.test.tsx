import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { KnowledgeBasePage } from "./KnowledgeBasePage";
import {
  deleteKnowledgeSource,
  getKnowledgeSource,
  getKnowledgeSources,
  uploadKnowledgeDocument,
} from "../services/productApi";

const sessionState = vi.hoisted(() => ({
  session: {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    tokenType: "bearer",
    user: {
      id: "user-1",
      email: "kleiton2102@gmail.com",
      xp: 120,
      level: 2,
      streak: 4,
      is_admin: true,
      avatar_url: null,
    },
  } as any,
}));

const router = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/features/app/hooks/useAuthSession", () => ({
  useAuthSession: () => sessionState.session,
}));

vi.mock("../services/productApi", () => ({
  deleteKnowledgeSource: vi.fn(),
  getKnowledgeSource: vi.fn(),
  getKnowledgeSources: vi.fn(),
  uploadKnowledgeDocument: vi.fn(),
}));

describe("KnowledgeBasePage", () => {
  beforeEach(() => {
    router.replace.mockReset();
    vi.unstubAllGlobals();
    vi.mocked(getKnowledgeSources).mockResolvedValue({
      sources: [
        {
          id: "rules.md",
          name: "rules.md",
          type: "markdown",
          last_updated: "2026-04-27T00:00:00Z",
        },
      ],
    });
    vi.mocked(getKnowledgeSource).mockResolvedValue({
      id: "rules.md",
      name: "rules.md",
      type: "markdown",
      last_updated: "2026-04-27T00:00:00Z",
      content: "# Rules\nUse grounded answers.",
    });
    vi.mocked(deleteKnowledgeSource).mockResolvedValue(undefined);
    vi.mocked(uploadKnowledgeDocument).mockResolvedValue({ message: "ok" });
  });

  it("shows selected document content", async () => {
    const user = userEvent.setup();
    render(<KnowledgeBasePage />);

    await user.click(await screen.findByRole("button", { name: /View Content/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent("# Rules");
    expect(dialog).toHaveTextContent("Use grounded answers.");
    expect(getKnowledgeSource).toHaveBeenCalledWith("access-token", "rules.md");
  });

  it("deletes a document after confirmation", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    render(<KnowledgeBasePage />);

    await user.click(await screen.findByRole("button", { name: /Delete rules.md/i }));

    await waitFor(() => {
      expect(deleteKnowledgeSource).toHaveBeenCalledWith("access-token", "rules.md");
    });
  });
});
