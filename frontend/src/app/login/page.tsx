import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface lg:grid lg:grid-cols-[minmax(420px,0.9fr)_minmax(0,1.1fr)]">
      <LoginForm />
      <section
        aria-label="Language practice preview"
        className="relative hidden min-h-screen overflow-hidden lg:block"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(19,19,21,0.1), rgba(19,19,21,0.76)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="max-w-xl">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white/70">
              Practice with context
            </p>
            <h2 className="mb-4 text-[40px] font-bold leading-tight text-white font-manrope">
              Build vocabulary from real conversations.
            </h2>
            <p className="max-w-lg text-base leading-7 text-white/75">
              FluencyAI turns guided practice, role play, and your knowledge base into daily language progress.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
