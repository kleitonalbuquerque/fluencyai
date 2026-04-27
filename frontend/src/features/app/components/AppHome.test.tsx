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
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/app",
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
    } as any;
    router.replace.mockReset();
    router.push.mockReset();
  });

  it("shows the authenticated user dashboard metrics", () => {
    render(<AppHome />);

    // Check for user-specific welcome
    expect(screen.getByText(/Welcome back, ana/i)).toBeInTheDocument();
    
    // Check for metrics
    expect(screen.getByText("120 XP")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Level
    expect(screen.getByText("4 days")).toBeInTheDocument();
  });

  it("renders navigation links to features", () => {
    render(<AppHome />);

    expect(screen.getByRole("link", { name: /Immersion Plan/i })).toHaveAttribute(
      "href",
      "/app/plan",
    );
    expect(screen.getByRole("link", { name: /AI Chat/i })).toHaveAttribute(
      "href",
      "/app/chat",
    );
    expect(screen.getByRole("link", { name: /Memorization/i })).toHaveAttribute(
      "href",
      "/app/memorization",
    );
  });

  it("returns null if not authenticated", () => {
    sessionState.session = null;

    const { container } = render(<AppHome />);

    expect(container.firstChild).toBeNull();
  });
});
