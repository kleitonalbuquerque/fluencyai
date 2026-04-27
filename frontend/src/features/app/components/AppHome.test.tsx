import { render, screen } from "@testing-library/react";
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

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("../hooks/useAuthSession", () => ({
  useAuthSession: () => sessionState.session,
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
  });

  it("redirects anonymous visitors to login", () => {
    sessionState.session = null;

    render(<AppHome />);

    expect(router.replace).toHaveBeenCalledWith("/login");
  });
});
