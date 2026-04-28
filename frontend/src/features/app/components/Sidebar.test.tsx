import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/features/auth/domain/types";
import { Sidebar } from "./Sidebar";

const router = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/app",
  useRouter: () => router,
}));

function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "user-1",
    email: "ana@example.com",
    xp: 120,
    level: 2,
    streak: 4,
    is_admin: false,
    avatar_url: null,
    ...overrides,
  };
}

describe("Sidebar", () => {
  beforeEach(() => {
    router.replace.mockReset();
  });

  it("hides Knowledge Base for regular users", async () => {
    render(<Sidebar user={buildUser()} />);

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Knowledge Base")).not.toBeInTheDocument();
  });

  it("hides Knowledge Base for admins with a different email", async () => {
    render(<Sidebar user={buildUser({ is_admin: true, email: "admin@example.com" })} />);

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Knowledge Base")).not.toBeInTheDocument();
  });

  it("shows Knowledge Base for the authorized admin", async () => {
    render(
      <Sidebar
        user={buildUser({
          is_admin: true,
          email: "kleiton2102@gmail.com",
        })}
      />,
    );

    expect(await screen.findByText("Knowledge Base")).toBeInTheDocument();
  });
});
