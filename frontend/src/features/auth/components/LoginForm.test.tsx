import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./LoginForm";

const loginHookState = vi.hoisted(() => ({
  error: null as string | null,
  isPending: false,
  login: vi.fn(),
}));

vi.mock("../hooks/useLogin", () => ({
  useLogin: () => loginHookState,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    loginHookState.error = null;
    loginHookState.isPending = false;
    loginHookState.login.mockReset();
  });

  it("submits credentials through the auth hook", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(loginHookState.login).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "strong-password",
    });
  });

  it("shows login errors from the auth hook", () => {
    loginHookState.error = "Credenciais inválidas";

    render(<LoginForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("Credenciais inválidas");
  });
});
