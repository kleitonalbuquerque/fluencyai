import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AiConversationPage } from "./AiConversationPage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

const mockSession = {
  accessToken: "test-token",
  refreshToken: "refresh-token",
  tokenType: "bearer",
  user: {
    id: "user-1",
    email: "student@example.com",
    xp: 0,
    level: 1,
    streak: 0,
    is_admin: false,
    avatar_url: null,
  },
};

vi.mock("@/features/auth/services/authSession", () => ({
  AUTH_SESSION_UPDATED_EVENT: "fluencyai.auth.updated",
  getAuthSession: () => mockSession,
  setAuthSession: vi.fn(),
  clearAuthSession: vi.fn(),
}));

const mockSendAiMessage = vi.fn();

vi.mock("../services/productApi", () => ({
  sendAiMessage: (...args: unknown[]) => mockSendAiMessage(...args),
}));

describe("AiConversationPage", () => {
  beforeEach(() => {
    mockSendAiMessage.mockReset();
  });

  it("renders the initial greeting message", () => {
    render(<AiConversationPage />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("sends user message and renders AI reply in the chat", async () => {
    mockSendAiMessage.mockResolvedValue({
      reply: "Great effort! Use 'went' instead of 'go'.",
      correction: "Say 'I went to the cafe yesterday'.",
      suggested_vocabulary: ["went", "yesterday", "actually"],
    });

    render(<AiConversationPage />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "I go to cafe yesterday" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText("I go to cafe yesterday")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText("Great effort! Use 'went' instead of 'go'."),
      ).toBeInTheDocument();
    });
  });

  it("shows correction feedback after AI response", async () => {
    mockSendAiMessage.mockResolvedValue({
      reply: "Good job!",
      correction: "Say 'I went to the cafe yesterday'.",
      suggested_vocabulary: ["went"],
    });

    render(<AiConversationPage />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "I go cafe" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Say 'I went to the cafe yesterday'."),
      ).toBeInTheDocument();
    });
  });

  it("clears the input after sending", async () => {
    mockSendAiMessage.mockResolvedValue({
      reply: "Hello!",
      correction: "",
      suggested_vocabulary: [],
    });

    render(<AiConversationPage />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Hello there" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });

  it("disables the send button while a request is pending", async () => {
    let resolveFn: (value: unknown) => void;
    mockSendAiMessage.mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve;
      }),
    );

    render(<AiConversationPage />);

    const textarea = screen.getByRole("textbox");
    const sendButton = screen.getByRole("button", { name: /send/i });

    fireEvent.change(textarea, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    expect(sendButton).toBeDisabled();

    resolveFn!({ reply: "Done", correction: "", suggested_vocabulary: [] });

    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });
});
