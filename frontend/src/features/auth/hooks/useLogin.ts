"use client";

import { useState } from "react";

import type { AuthResponse, LoginCredentials } from "../domain/types";
import { loginWithEmail } from "../services/authApi";
import { HttpError } from "@/services/http/client";

type LoginState = {
  error: string | null;
  isPending: boolean;
};

const TOKEN_STORAGE_KEY = "fluencyai.auth";

function toUserMessage(error: unknown): string {
  if (error instanceof HttpError && error.status === 401) {
    return "Credenciais inválidas";
  }

  if (error instanceof HttpError) {
    return error.message;
  }

  return "Não foi possível entrar agora";
}

function persistSession(auth: AuthResponse): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    TOKEN_STORAGE_KEY,
    JSON.stringify({
      accessToken: auth.access_token,
      refreshToken: auth.refresh_token,
      tokenType: auth.token_type,
      user: auth.user,
    }),
  );
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
      persistSession(auth);
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
