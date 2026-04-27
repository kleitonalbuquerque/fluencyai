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
    <section className="w-full max-w-md mx-auto p-8 flex flex-col justify-center min-h-screen lg:min-h-0 lg:p-12 relative">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-xl">language</span>
          </div>
          <span className="text-indigo-400 font-extrabold text-xl font-manrope">FluencyAI</span>
        </div>
        <h1 className="text-[32px] font-bold text-white mb-2 font-manrope">Reset Password</h1>
        <p className="text-neutral-500 font-medium">
          Remembered it?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Go back to Sign In
          </Link>
        </p>
      </header>

      <form className="space-y-6" method="POST" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500" htmlFor="email">
            E-mail
          </label>
          <input
            autoComplete="email"
            className="w-full bg-surface-container-low border border-white/10 rounded-xl p-4 text-on-surface placeholder-neutral-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        {message ? (
          <div className="p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl text-tertiary text-sm font-medium" role="status">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium" role="alert">
            {error}
          </div>
        ) : null}

        <button 
          className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(189,194,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]" 
          disabled={isPending} 
          type="submit"
        >
          {isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </section>
  );
}
