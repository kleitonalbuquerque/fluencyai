import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppHome } from "./AppHome";

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

const authSession = vi.hoisted(() => ({
  clearAuthSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("../hooks/useAuthSession", () => ({
  useAuthSession: () => sessionState.session,
}));

vi.mock("@/features/auth/services/authSession", () => ({
  clearAuthSession: authSession.clearAuthSession,
}));

describe("AppHome", () => {
  beforeEach(() => {
    sessionState.session = {
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
    };
    router.replace.mockReset();
    authSession.clearAuthSession.mockReset();
  });

  it("shows the authenticated user dashboard", () => {
    render(<AppHome />);

    expect(screen.getByText("FluencyAI")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("120 XP")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configurações da conta" })).toHaveAttribute(
      "href",
      "/app/settings",
    );
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Plano de imersão" })).toHaveAttribute(
      "href",
      "/app/plan",
    );
    expect(screen.getByRole("link", { name: "Conversa com IA" })).toHaveAttribute(
      "href",
      "/app/chat",
    );
  });

  it("redirects anonymous visitors to login", () => {
    sessionState.session = null;

    render(<AppHome />);

    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("clears the session and redirects when the user logs out", async () => {
    const user = userEvent.setup();

    render(<AppHome />);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(authSession.clearAuthSession).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/login");
  });
});
