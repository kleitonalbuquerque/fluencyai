"use client";

import { FormEvent, useState } from "react";

import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const { error, isPending, login } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login({ email, password });
  }

  return (
    <section className="login-panel" aria-labelledby="login-title">
      <header className="login-header">
        <h1 id="login-title" className="login-title">
          Entrar no FluencyAI
        </h1>
        <p className="login-subtitle">
          Continue seu plano diário, mantenha o streak e pratique com IA.
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

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            autoComplete="current-password"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>

        {error ? (
          <div className="login-error" role="alert">
            {error}
          </div>
        ) : null}

        <button className="login-submit" disabled={isPending} type="submit">
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="login-meta">Acesso seguro com JWT e refresh token.</p>
    </section>
  );
}
