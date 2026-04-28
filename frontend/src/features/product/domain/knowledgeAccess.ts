import type { AuthUser } from "@/features/auth/domain/types";

const KNOWLEDGE_MANAGER_EMAIL = "kleiton2102@gmail.com";

export function canManageKnowledge(user?: Pick<AuthUser, "email" | "is_admin"> | null): boolean {
  return Boolean(
    user?.is_admin &&
      user.email.trim().toLowerCase() === KNOWLEDGE_MANAGER_EMAIL,
  );
}
