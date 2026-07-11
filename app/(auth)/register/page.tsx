import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Inscription | ValoStats",
  description: "Créez votre compte ValoStats gratuitement et commencez à analyser vos performances Valorant.",
};

export default function RegisterPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
          <p className="mt-2 text-sm text-zinc-400">Commencez à analyser vos parties Valorant</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-zinc-400">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-red-500 hover:text-red-400 underline-offset-4 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
