import { PasswordResetRequestForm } from "@/features/auth/components/PasswordResetRequestForm";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-shell">
      <PasswordResetRequestForm />
      <div className="auth-image" />
    </main>
  );
}
