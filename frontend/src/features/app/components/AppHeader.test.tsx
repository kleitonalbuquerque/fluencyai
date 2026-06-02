import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppHeader, getStreakFlameClass } from "./AppHeader";
import { START_LESSON_STORAGE_KEY } from "@/features/product/domain/immersionStart";

const navigation = vi.hoisted(() => ({
  pathname: "/app/knowledge",
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}));

vi.mock("@/features/theme/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

describe("AppHeader", () => {
  beforeEach(() => {
    navigation.pathname = "/app/knowledge";
    navigation.push.mockReset();
    window.sessionStorage.clear();
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

  it("starts the lesson from the header", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);

    await user.click(screen.getByRole("button", { name: "Start Lesson" }));

    expect(window.sessionStorage.getItem(START_LESSON_STORAGE_KEY)).toBe("1");
    expect(navigation.push).toHaveBeenCalledWith("/app/plan");
  });

  it("cycles streak flame color through a weekly heat scale", () => {
    expect(getStreakFlameClass(0)).toBe("text-primary");
    expect(getStreakFlameClass(1)).toBe("text-primary");
    expect(getStreakFlameClass(2)).toBe("text-yellow-300");
    expect(getStreakFlameClass(4)).toBe("text-orange-300");
    expect(getStreakFlameClass(7)).toBe("text-red-500");
    expect(getStreakFlameClass(8)).toBe("text-primary");
  });
});
