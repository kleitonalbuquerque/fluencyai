import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <LoginForm />
      <div className="auth-image" />
    </main>
  );
}
