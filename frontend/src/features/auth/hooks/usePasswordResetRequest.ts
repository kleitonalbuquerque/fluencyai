"use client";

import { useState } from "react";

import type { PasswordResetRequest } from "../domain/types";
import { requestPasswordReset as requestPasswordResetWithEmail } from "../services/authApi";
import { HttpError } from "@/services/http/client";

type PasswordResetRequestState = {
  error: string | null;
  isPending: boolean;
  message: string | null;
};

const SUCCESS_MESSAGE =
  "Se o e-mail existir, enviaremos instruções para redefinir sua senha.";

function toUserMessage(error: unknown): string {
  if (error instanceof HttpError) {
    return error.message;
  }

  return "Não foi possível solicitar a recuperação agora";
}

export function usePasswordResetRequest() {
  const [state, setState] = useState<PasswordResetRequestState>({
    error: null,
    isPending: false,
    message: null,
  });

  async function requestPasswordReset(
    payload: PasswordResetRequest,
  ): Promise<boolean> {
    setState({ error: null, isPending: true, message: null });

    try {
      await requestPasswordResetWithEmail(payload);
      setState({ error: null, isPending: false, message: SUCCESS_MESSAGE });
      return true;
    } catch (error) {
      setState({
        error: toUserMessage(error),
        isPending: false,
        message: null,
      });
      return false;
    }
  }

  return {
    error: state.error,
    isPending: state.isPending,
    message: state.message,
    requestPasswordReset,
  };
}
