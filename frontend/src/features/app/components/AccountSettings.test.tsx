import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountSettings } from "./AccountSettings";

const router = vi.hoisted(() => ({
  replace: vi.fn(),
}));

const settingsHookState = vi.hoisted(() => ({
  avatarPreview: null as string | null,
  changePassword: vi.fn(),
  error: null as string | null,
  isPending: false,
  message: null as string | null,
  updateAvatar: vi.fn(),
  user: {
    id: "user-1",
    email: "ana@example.com",
    xp: 120,
    level: 2,
    streak: 4,
    avatar_url: null,
  },
}));

vi.mock("../hooks/useAccountSettings", () => ({
  useAccountSettings: () => settingsHookState,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/app/settings",
}));

describe("AccountSettings", () => {
  beforeEach(() => {
    settingsHookState.avatarPreview = null;
    settingsHookState.changePassword.mockReset();
    settingsHookState.error = null;
    settingsHookState.isPending = false;
    settingsHookState.message = null;
    settingsHookState.updateAvatar.mockReset();
  });

  it("submits password changes", async () => {
    const user = userEvent.setup();
    render(<AccountSettings />);

    await user.type(screen.getByLabelText("Senha atual"), "strong-password");
    await user.type(screen.getByLabelText("Nova senha"), "new-strong-password");
    await user.click(screen.getByRole("button", { name: "Alterar senha" }));

    expect(settingsHookState.changePassword).toHaveBeenCalledWith({
      current_password: "strong-password",
      new_password: "new-strong-password",
    });
  });

  it("uploads an avatar file", async () => {
    const user = userEvent.setup();
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    render(<AccountSettings />);

    await user.upload(screen.getByLabelText("Imagem do avatar"), file);

    expect(settingsHookState.updateAvatar).toHaveBeenCalledWith(file);
  });
});
