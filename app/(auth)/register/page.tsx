import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Inscription | ValoStats",
  description: "Créez votre compte ValoStats gratuitement et commencez à analyser vos performances Valorant.",
};

export default function RegisterPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand-br flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-lg shadow-accent-glow">
            V
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Créer un compte</h1>
          <p className="mt-2 text-sm text-text-muted">Commencez à analyser vos parties Valorant</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-8">
          <RegisterForm />
        </div>
        <p className="text-center text-sm text-text-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover underline-offset-4 hover:underline transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
