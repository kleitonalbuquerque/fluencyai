import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppHeader } from "./AppHeader";

const navigation = vi.hoisted(() => ({
  pathname: "/app/knowledge",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("@/features/theme/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

describe("AppHeader", () => {
  beforeEach(() => {
    navigation.pathname = "/app/knowledge";
  });

  it("maps app routes to page titles and user stats", () => {
    render(
      <AppHeader
        user={{
          id: "user-1",
          email: "ana@example.com",
          xp: 120,
          level: 2,
          streak: 4,
          is_admin: true,
          avatar_url: null,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Knowledge Base" })).toBeInTheDocument();
    expect(screen.getByText("Level 2")).toBeInTheDocument();
    expect(screen.getByText("120 XP")).toBeInTheDocument();
    expect(screen.getByText("4 Day Streak")).toBeInTheDocument();
  });

  it("uses explicit titles and opens the mobile menu", async () => {
    const user = userEvent.setup();
    const onMenuToggle = vi.fn();
    navigation.pathname = "/app";

    render(<AppHeader title="Custom" onMenuToggle={onMenuToggle} />);

    await user.click(screen.getByText("menu").closest("button")!);

    expect(screen.getByRole("heading", { name: "Custom" })).toBeInTheDocument();
    expect(onMenuToggle).toHaveBeenCalled();
  });
});
