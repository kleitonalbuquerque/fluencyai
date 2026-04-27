import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
    
    // Mock matchMedia to prefer light
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("toggles the app theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    // Initial state is light (matches: false)
    const button = await screen.findByRole("button");
    
    // Click to switch to dark mode
    await user.click(button);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("fluencyai.theme")).toBe("dark");

    // Click to switch back to light mode
    await user.click(button);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("fluencyai.theme")).toBe("light");
  });
});
