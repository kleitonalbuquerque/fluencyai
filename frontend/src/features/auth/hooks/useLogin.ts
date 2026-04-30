"use client";

import { useState } from "react";

import type { AuthResponse, LoginCredentials } from "../domain/types";
import { persistAuthSession } from "../services/authSession";
import { loginWithEmail } from "../services/authApi";
import { HttpError } from "@/services/http/client";

type LoginState = {
  error: string | null;
  isPending: boolean;
};

function toUserMessage(error: unknown): string {
  if (error instanceof HttpError && error.status === 401) {
    return "E-mail ou senha inválidos. Confira os dados e tente novamente.";
  }

  if (error instanceof HttpError && error.status === 422) {
    return "Preencha um e-mail válido e uma senha com pelo menos 8 caracteres.";
  }

  if (error instanceof HttpError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return "Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8000.";
  }

  return "Não foi possível entrar agora. Tente novamente em instantes.";
}

export function useLogin() {
  const [state, setState] = useState<LoginState>({
    error: null,
    isPending: false,
  });

  async function login(credentials: LoginCredentials): Promise<AuthResponse | null> {
    setState({ error: null, isPending: true });

    try {
      const auth = await loginWithEmail(credentials);
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
    login,
  };
}
