import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./LoginForm";

const loginHookState = vi.hoisted(() => ({
  error: null as string | null,
  isPending: false,
  login: vi.fn(),
}));

const router = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("../hooks/useLogin", () => ({
  useLogin: () => loginHookState,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    loginHookState.error = null;
    loginHookState.isPending = false;
    loginHookState.login.mockReset();
    router.push.mockReset();
  });

  it("submits credentials through the auth hook", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(loginHookState.login).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "strong-password",
    });
  });

  it("redirects to the app after login", async () => {
    const user = userEvent.setup();
    loginHookState.login.mockResolvedValue({
      access_token: "access-token",
      refresh_token: "refresh-token",
      token_type: "bearer",
      user: {
        id: "user-1",
        email: "ana@example.com",
        xp: 0,
        level: 1,
        streak: 0,
        avatar_url: null,
      },
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(router.push).toHaveBeenCalledWith("/app");
  });

  it("shows login errors from the auth hook", () => {
    loginHookState.error = "E-mail ou senha inválidos. Confira os dados e tente novamente.";

    render(<LoginForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível entrar");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "E-mail ou senha inválidos. Confira os dados e tente novamente.",
    );
  });
});
