import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Connexion | ValoStats",
  description: "Connectez-vous à votre compte ValoStats pour accéder à vos statistiques et analyses Valorant.",
};

export default function LoginPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bon retour</h1>
          <p className="mt-2 text-sm text-zinc-400">Connectez-vous à votre compte ValoStats</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-zinc-400">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-red-500 hover:text-red-400 underline-offset-4 hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </main>
  );
}
