import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  it("toggles the app theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Ativar modo claro" }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("fluencyai.theme")).toBe("light");

    await user.click(screen.getByRole("button", { name: "Ativar modo escuro" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("fluencyai.theme")).toBe("dark");
  });
});
