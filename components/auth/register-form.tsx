"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface PasswordCheck {
  label: string;
  test: (p: string) => boolean;
}

const CHECKS: PasswordCheck[] = [
  { label: "12 caractères minimum", test: (p) => p.length >= 12 },
  { label: "Une lettre majuscule", test: (p) => /[A-Z]/.test(p) },
  { label: "Une lettre minuscule", test: (p) => /[a-z]/.test(p) },
  { label: "Un chiffre", test: (p) => /\d/.test(p) },
  { label: "Un symbole", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {CHECKS.map((check) => {
          const ok = check.test(password);
          return (
            <div
              key={check.label}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                password.length === 0 ? "bg-slate-700" : ok ? "bg-emerald-500" : "bg-slate-700"
              }`}
            />
          );
        })}
      </div>
      <ul className="space-y-0.5">
        {CHECKS.map((check) => {
          const ok = password.length > 0 && check.test(password);
          const neutral = password.length === 0;
          return (
            <li
              key={check.label}
              className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                neutral ? "text-slate-500" : ok ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                {ok ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <line x1="18" y1="6" x2="6" y2="18" />
                )}
              </svg>
              {check.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RegisterForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { addToast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'inscription.");
      }

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        addToast({ variant: "warning", title: "Connexion", description: "Inscription réussie, connexion automatique en cours…" });
        setIsLoading(false);
      } else {
        addToast({ variant: "success", title: "Bienvenue sur ValoStats", description: "Votre compte a été créé avec succès." });
        setIsLoading(false);
        window.location.href = "/dashboard";
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
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-950/50 p-3 text-sm text-red-400 border border-red-900/50" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Pseudo Riot</label>
        <Input
          id="name"
          type="text"
          placeholder="JettMain"
          required
          disabled={isLoading}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input
          id="email"
          type="email"
          placeholder="joueur@exemple.com"
          required
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
        <Input
          id="password"
          type="password"
          required
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordStrength password={password} />
      </div>
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Créer mon compte
      </Button>
    </form>
  );
}
