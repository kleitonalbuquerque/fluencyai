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
    <section className="w-full max-w-md mx-auto p-8 flex flex-col justify-center min-h-screen lg:min-h-0 lg:p-12 relative">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-xl">language</span>
          </div>
          <span className="text-indigo-400 font-extrabold text-xl font-manrope">FluencyAI</span>
        </div>
        <h1 className="text-[32px] font-bold text-white mb-2 font-manrope">Start your journey</h1>
        <p className="text-neutral-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign In
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

        <div className="space-y-2">
          <label className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500" htmlFor="password">
            Password
          </label>
          <input
            autoComplete="new-password"
            className="w-full bg-surface-container-low border border-white/10 rounded-xl p-4 text-on-surface placeholder-neutral-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="password"
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Min. 8 characters"
            required
            type="password"
            value={password}
          />
        </div>

        <p className="text-[11px] text-neutral-500 leading-relaxed">
          By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>

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
          {isPending ? "Creating Account..." : "Create Account"}
        </button>

        <div className="relative py-4 flex items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase">Or register with</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <SocialAuthButtons />
      </form>
    </section>
  );
}
