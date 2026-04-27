"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { usePasswordResetRequest } from "../hooks/usePasswordResetRequest";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

export function PasswordResetRequestForm() {
  const { error, isPending, message, requestPasswordReset } =
    usePasswordResetRequest();
  const [email, setEmail] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestPasswordReset({ email });
  }

  return (
    <section className="login-panel" aria-labelledby="password-reset-title">
      <div className="auth-toolbar">
        <ThemeToggle />
      </div>

      <header className="login-header">
        <div className="brand-mark" aria-hidden="true">
          F
        </div>
        <h1 id="password-reset-title" className="login-title">
          Redefinir senha
        </h1>
        <p className="login-subtitle">
          Lembrou a senha? <Link href="/login">Voltar para login</Link>
        </p>
      </header>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            autoComplete="email"
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>

        {message ? (
          <div className="login-success" role="status">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="login-error" role="alert">
            {error}
          </div>
        ) : null}

        <button className="login-submit" disabled={isPending} type="submit">
          {isPending ? "Enviando..." : "Enviar instruções"}
        </button>
      </form>
    </section>
  );
}
