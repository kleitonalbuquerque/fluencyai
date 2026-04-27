import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "./SignupForm";

const signupHookState = vi.hoisted(() => ({
  error: null as string | null,
  isPending: false,
  signup: vi.fn(),
}));

const router = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("../hooks/useSignup", () => ({
  useSignup: () => signupHookState,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

describe("SignupForm", () => {
  beforeEach(() => {
    signupHookState.error = null;
    signupHookState.isPending = false;
    signupHookState.signup.mockReset();
    router.push.mockReset();
  });

  it("submits new account credentials through the auth hook", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(signupHookState.signup).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "strong-password",
    });
  });

  it("redirects to the app after creating an account", async () => {
    const user = userEvent.setup();
    signupHookState.signup.mockResolvedValue({
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
    render(<SignupForm />);

    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(router.push).toHaveBeenCalledWith("/app");
  });

  it("shows duplicate email feedback from the auth hook", () => {
    signupHookState.error = "Este e-mail já está cadastrado";

    render(<SignupForm />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Este e-mail já está cadastrado",
    );
  });
});
