"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { usePasswordResetRequest } from "../hooks/usePasswordResetRequest";

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
      <header className="login-header">
        <h1 id="password-reset-title" className="login-title">
          Redefinir senha
        </h1>
        <p className="login-subtitle">
          Informe o e-mail da conta para receber as instruções de recuperação.
        </p>
      </header>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
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

      <nav className="auth-links" aria-label="Acesso da conta">
        <Link href="/login">Voltar para login</Link>
      </nav>
    </section>
  );
}
