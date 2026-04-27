"use client";

import { useState } from "react";

import type { AuthResponse, SignupCredentials } from "../domain/types";
import { signupWithEmail } from "../services/authApi";
import { persistAuthSession } from "../services/authSession";
import { HttpError } from "@/services/http/client";

type SignupState = {
  error: string | null;
  isPending: boolean;
};

function toUserMessage(error: unknown): string {
  if (error instanceof HttpError && error.status === 409) {
    return "Este e-mail já está cadastrado. Use outro e-mail ou entre na sua conta.";
  }

  if (error instanceof HttpError) {
    return error.message;
  }

  return "Não foi possível criar sua conta agora";
}

export function useSignup() {
  const [state, setState] = useState<SignupState>({
    error: null,
    isPending: false,
  });

  async function signup(
    credentials: SignupCredentials,
  ): Promise<AuthResponse | null> {
    setState({ error: null, isPending: true });

    try {
      const auth = await signupWithEmail(credentials);
      persistAuthSession(auth);
      setState({ error: null, isPending: false });
      return auth;
    } catch (error) {
      setState({ error: toUserMessage(error), isPending: false });
      return null;
    }
  }

  return {
    error: state.error,
    isPending: state.isPending,
    signup,
  };
}
