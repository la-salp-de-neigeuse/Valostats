import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Inscription | ValoStats",
  description: "Your Valorant performance, redefined.",
};

export default function RegisterPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <Image
              src="/logo.png"
              alt="ValoStats"
              fill
              sizes="56px"
              className="object-contain logo-image"
              priority
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Créer un compte</h1>
          <p className="mt-2 text-sm text-text-muted">Your Valorant performance, redefined.</p>
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
