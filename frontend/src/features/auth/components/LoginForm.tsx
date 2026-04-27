"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SocialAuthButtons } from "./SocialAuthButtons";
import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const { error, isPending, login } = useLogin();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const auth = await login({ email, password });
    if (auth) {
      router.push("/app");
    }
  }

  return (
    <section className="login-panel" aria-labelledby="login-title">
      <header className="login-header">
        <div className="brand-wordmark">FluencyAI</div>
        <h1 id="login-title" className="login-title">
          Entrar na sua conta
        </h1>
        <p className="login-subtitle">
          Novo por aqui? <Link href="/signup">Criar conta</Link>
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
            autoComplete="current-password"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>

        <div className="form-row">
          <label className="remember-option">
            <input type="checkbox" />
            <span>Lembrar de mim</span>
          </label>
          <Link href="/forgot-password">Esqueci minha senha</Link>
        </div>

        {error ? (
          <div className="login-error" role="alert">
            {error}
          </div>
        ) : null}

        <button className="login-submit" disabled={isPending} type="submit">
          {isPending ? "Entrando..." : "Entrar"}
        </button>

        <div className="auth-divider">
          <span>Ou continue com</span>
        </div>

        <SocialAuthButtons />
      </form>
    </section>
  );
}
