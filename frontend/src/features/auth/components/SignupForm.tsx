"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SocialAuthButtons } from "./SocialAuthButtons";
import { useSignup } from "../hooks/useSignup";

export function SignupForm() {
  const { error, isPending, signup } = useSignup();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const auth = await signup({ email, password });
    if (auth) {
      router.push("/app");
    }
  }

  return (
    <section className="login-panel" aria-labelledby="signup-title">
      <header className="login-header">
        <div className="brand-wordmark">FluencyAI</div>
        <h1 id="signup-title" className="login-title">
          Criar sua conta
        </h1>
        <p className="login-subtitle">
          Já tem acesso? <Link href="/login">Entrar</Link>
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

        <div className="auth-divider">
          <span>Ou continue com</span>
        </div>

        <SocialAuthButtons />
      </form>
    </section>
  );
}
