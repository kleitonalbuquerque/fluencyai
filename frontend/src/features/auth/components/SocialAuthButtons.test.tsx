import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SocialAuthButtons } from "./SocialAuthButtons";

describe("SocialAuthButtons", () => {
  it("renders Google and GitHub actions with brand icons", () => {
    render(<SocialAuthButtons />);

    expect(screen.getByRole("button", { name: "Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.getByTestId("google-icon")).toBeInTheDocument();
    expect(screen.getByTestId("github-icon")).toBeInTheDocument();
  });
});
