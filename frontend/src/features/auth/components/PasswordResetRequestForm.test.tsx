import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PasswordResetRequestForm } from "./PasswordResetRequestForm";

const resetHookState = vi.hoisted(() => ({
  error: null as string | null,
  isPending: false,
  message: null as string | null,
  requestPasswordReset: vi.fn(),
}));

vi.mock("../hooks/usePasswordResetRequest", () => ({
  usePasswordResetRequest: () => resetHookState,
}));

describe("PasswordResetRequestForm", () => {
  beforeEach(() => {
    resetHookState.error = null;
    resetHookState.isPending = false;
    resetHookState.message = null;
    resetHookState.requestPasswordReset.mockReset();
  });

  it("submits the email through the auth hook", async () => {
    const user = userEvent.setup();
    render(<PasswordResetRequestForm />);

    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Enviar instruções" }));

    expect(resetHookState.requestPasswordReset).toHaveBeenCalledWith({
      email: "ana@example.com",
    });
  });

  it("shows feedback after requesting password reset", () => {
    resetHookState.message = "Confira seu e-mail para continuar";

    render(<PasswordResetRequestForm />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Confira seu e-mail para continuar",
    );
  });
});
