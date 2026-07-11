"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'inscription.");
      }

      // Connexion automatique
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Inscription réussie, mais impossible de vous connecter automatiquement.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue.");
      }
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-950/50 p-3 text-sm text-red-400 border border-red-900/50" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Pseudo Riot</label>
        <Input id="name" name="name" type="text" placeholder="JettMain" required disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input id="email" name="email" type="email" placeholder="joueur@exemple.com" required disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
        <Input id="password" name="password" type="password" required disabled={isLoading} />
        <p className="text-xs text-zinc-500">Min 12 caractères, Maj, Min, Chiffre, Symbole.</p>
      </div>
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Créer mon compte
      </Button>
    </form>
  );
}
