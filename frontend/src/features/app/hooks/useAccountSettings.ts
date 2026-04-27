"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthUser, ChangePasswordPayload } from "@/features/auth/domain/types";
import {
  changePassword as changePasswordRequest,
  updateAvatar as updateAvatarRequest,
} from "@/features/auth/services/authApi";
import {
  getAuthSession,
  updateStoredUser,
} from "@/features/auth/services/authSession";
import { HttpError } from "@/services/http/client";

type AccountSettingsState = {
  error: string | null;
  isPending: boolean;
  message: string | null;
  user: AuthUser | null;
};

function toUserMessage(error: unknown): string {
  if (error instanceof HttpError && error.status === 401) {
    return "Sessão expirada ou senha atual inválida";
  }

  if (error instanceof HttpError) {
    return error.message;
  }

  return "Não foi possível salvar as alterações";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function useAccountSettings() {
  const router = useRouter();
  const session = getAuthSession();
  const [state, setState] = useState<AccountSettingsState>({
    error: null,
    isPending: false,
    message: null,
    user: session?.user ?? null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    session?.user.avatar_url ?? null,
  );

  async function changePassword(payload: ChangePasswordPayload): Promise<boolean> {
    if (!session) {
      router.replace("/login");
      return false;
    }

    setState((current) => ({
      ...current,
      error: null,
      isPending: true,
      message: null,
    }));

    try {
      await changePasswordRequest(session.accessToken, payload);
      setState((current) => ({
        ...current,
        error: null,
        isPending: false,
        message: "Senha alterada com sucesso",
      }));
      return true;
    } catch (error) {
      setState((current) => ({
        ...current,
        error: toUserMessage(error),
        isPending: false,
        message: null,
      }));
      return false;
    }
  }

  async function updateAvatar(file: File): Promise<boolean> {
    if (!session) {
      router.replace("/login");
      return false;
    }

    setState((current) => ({
      ...current,
      error: null,
      isPending: true,
      message: null,
    }));

    try {
      const avatarUrl = await readFileAsDataUrl(file);
      const user = await updateAvatarRequest(session.accessToken, avatarUrl);
      updateStoredUser(user);
      setAvatarPreview(user.avatar_url);
      setState((current) => ({
        ...current,
        error: null,
        isPending: false,
        message: "Avatar atualizado com sucesso",
        user,
      }));
      return true;
    } catch (error) {
      setState((current) => ({
        ...current,
        error: toUserMessage(error),
        isPending: false,
        message: null,
      }));
      return false;
    }
  }

  return {
    avatarPreview,
    changePassword,
    error: state.error,
    isPending: state.isPending,
    message: state.message,
    updateAvatar,
    user: state.user,
  };
}
