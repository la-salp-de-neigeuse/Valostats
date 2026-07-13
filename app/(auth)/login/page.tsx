import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Connexion | ValoStats",
  description: "Connectez-vous à votre compte ValoStats pour accéder à vos statistiques et analyses Valorant.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const registered = (await searchParams).registered === "true";

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand-br flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-lg shadow-accent-glow">
            V
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Bon retour</h1>
          <p className="mt-2 text-sm text-text-muted">Connectez-vous à votre compte ValoStats</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-8">
          <LoginForm registered={registered} />
        </div>
        <p className="text-center text-sm text-text-muted">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-accent hover:text-accent-hover underline-offset-4 hover:underline transition-colors">
            {"S'inscrire"}
          </Link>
        </p>
      </div>
    </main>
  );
}

