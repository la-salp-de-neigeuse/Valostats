"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm({ registered }: { registered?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    const result = await signIn("credentials", {
      email,
      password,
      rememberMe: String(rememberMe),
      redirect: false,
    });

    if (result?.error) {
      const errorMessages: Record<string, string> = {
        CredentialsSignin: "Email ou mot de passe incorrect.",
      };
      setError(errorMessages[result.error] ?? result.error);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {registered && (
        <div className="rounded-md bg-emerald-950/50 p-3 text-sm text-emerald-400 border border-emerald-900/50" role="alert">
          Compte créé avec succès ! Connectez-vous avec vos identifiants.
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-950/50 p-3 text-sm text-red-400 border border-red-900/50 animate-fade-in" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="joueur@exemple.com"
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-controls="password"
            aria-pressed={showPassword}
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          name="rememberMe"
          defaultChecked
          className="h-4 w-4 rounded border-border bg-surface accent-accent text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        />
        <span className="text-sm text-text-secondary">Rester connecté</span>
      </label>
      <Button type="submit" className="w-full" isLoading={isLoading}>
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>
    </form>
  );
}
