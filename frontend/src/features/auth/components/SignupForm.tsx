"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { useSignup } from "../hooks/useSignup";

export function SignupForm() {
  const { error, isPending, signup } = useSignup();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await signup({ email, password });
  }

  return (
    <section className="login-panel" aria-labelledby="signup-title">
      <header className="login-header">
        <h1 id="signup-title" className="login-title">
          Criar conta
        </h1>
        <p className="login-subtitle">
          Comece seu plano diário e acompanhe XP, nível e streak desde o primeiro acesso.
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
            autoComplete="new-password"
            id="password"
            minLength={8}
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
          {isPending ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <nav className="auth-links" aria-label="Acesso da conta">
        <Link href="/login">Já tenho conta</Link>
      </nav>
    </section>
  );
}
