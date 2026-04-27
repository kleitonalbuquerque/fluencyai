"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { SettingsIcon } from "./AppIcons";
import type { AuthUser } from "@/features/auth/domain/types";
import { clearAuthSession } from "@/features/auth/services/authSession";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

function getInitials(email: string): string {
  return email.slice(0, 1).toUpperCase();
}

type AppHeaderProps = {
  user?: AuthUser | null;
};

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();

  function handleLogout() {
    clearAuthSession();
    router.replace("/login");
  }

  return (
    <header className="app-header">
      <Link className="app-brand" href="/app">
        FluencyAI
      </Link>
      <div className="app-actions">
        <ThemeToggle />
        <Link className="icon-link" href="/app/settings" aria-label="Configurações da conta">
          <SettingsIcon />
        </Link>
        {user ? (
          <div className="account-stack">
            <div className="avatar-chip" aria-label={user.email}>
              {user.avatar_url ? (
                <img alt="" src={user.avatar_url} />
              ) : (
                <span>{getInitials(user.email)}</span>
              )}
            </div>
            <button className="logout-button" onClick={handleLogout} type="button">
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
