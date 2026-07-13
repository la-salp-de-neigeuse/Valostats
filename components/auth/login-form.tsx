"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm({ registered }: { registered?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      const errorMessages: Record<string, string> = {
        CredentialsSignin: "Email ou mot de passe incorrect.",
      };
      setError(errorMessages[result.error] ?? result.error);
      setIsLoading(false);
    } else {
      setIsLoading(false);
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
        <Input id="email" name="email" type="email" placeholder="joueur@exemple.com" required disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
        <Input id="password" name="password" type="password" required disabled={isLoading} />
      </div>
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Se connecter
      </Button>
    </form>
  );
}
