import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "./SignupForm";

const signupHookState = vi.hoisted(() => ({
  error: null as string | null,
  isPending: false,
  signup: vi.fn(),
}));

vi.mock("../hooks/useSignup", () => ({
  useSignup: () => signupHookState,
}));

describe("SignupForm", () => {
  beforeEach(() => {
    signupHookState.error = null;
    signupHookState.isPending = false;
    signupHookState.signup.mockReset();
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

  it("shows duplicate email feedback from the auth hook", () => {
    signupHookState.error = "Este e-mail já está cadastrado";

    render(<SignupForm />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Este e-mail já está cadastrado",
    );
  });
});
