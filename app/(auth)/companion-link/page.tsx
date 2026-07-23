"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

type LinkState = "checking" | "pending" | "linking" | "linked" | "error" | "expired" | "already-used";

export default function CompanionLinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const { data: session, status: sessionStatus } = useSession();
  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!code) {
      setLinkState("error");
      setErrorMessage("Code de liaison manquant.");
      return;
    }
    if (sessionStatus === "loading") return;
    if (sessionStatus === "unauthenticated") return;
    handleLink();
  }, [code, sessionStatus]);

  async function handleLink() {
    if (!code) return;
    setLinkState("linking");
    try {
      const res = await fetch("/api/companion/link/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 410) {
          setLinkState("expired");
          setErrorMessage(data.error || "Code expiré");
        } else if (res.status === 409) {
          setLinkState("already-used");
          setErrorMessage(data.error || "Code déjà utilisé");
        } else {
          setLinkState("error");
          setErrorMessage(data.error || "Erreur lors de la liaison");
        }
        return;
      }
      setLinkState("linked");
    } catch {
      setLinkState("error");
      setErrorMessage("Erreur réseau. Veuillez réessayer.");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: `/companion-link?code=${code}`,
    });
    if (result?.error) {
      setErrorMessage("Email ou mot de passe incorrect");
    }
  }

  if (!code) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-14 h-14 mx-auto relative">
            <Image src="/logo.png" alt="ValoStats" fill sizes="56px" className="object-contain" priority unoptimized />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Lien invalide</h1>
          <p className="text-sm text-text-muted">Le code de liaison est manquant. Veuillez réessayer depuis le Companion.</p>
        </div>
      </main>
    );
  }

  if (sessionStatus === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-background">
        <p className="text-text-muted">Vérification de votre session...</p>
      </main>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto relative mb-4">
              <Image src="/logo.png" alt="ValoStats" fill sizes="56px" className="object-contain" priority unoptimized />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Connectez-vous</h1>
            <p className="mt-2 text-sm text-text-muted">Pour lier votre Companion, connectez-vous d&apos;abord.</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Votre mot de passe"
                  required
                />
              </div>
              {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
              <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                Se connecter
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-14 h-14 mx-auto relative">
          <Image src="/logo.png" alt="ValoStats" fill sizes="56px" className="object-contain" priority unoptimized />
        </div>

        {linkState === "pending" && (
          <>
            <h1 className="text-xl font-bold text-text-primary">Companion détecté</h1>
            <p className="text-sm text-text-muted">
              Un Companion ValoStats demande la liaison avec votre compte.
            </p>
            <div className="bg-surface border border-border rounded-xl p-6 space-y-1">
              <p className="text-xs text-text-muted uppercase tracking-wider">Code de liaison</p>
              <p className="text-3xl font-mono font-bold text-accent tracking-widest">{code}</p>
            </div>
            <button onClick={handleLink} className="bg-accent hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-xl transition-colors">
              Lier ce Companion
            </button>
            <p className="text-xs text-text-muted">Le code expire dans 10 minutes.</p>
          </>
        )}

        {linkState === "linking" && (
          <>
            <div className="w-10 h-10 mx-auto border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted">Liaison en cours...</p>
          </>
        )}

        {linkState === "linked" && (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-success/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary">Companion lié !</h1>
            <p className="text-sm text-text-muted">
              Votre Companion ValoStats est maintenant connecté à votre compte. Vous pouvez fermer cette page.
            </p>
          </>
        )}

        {linkState === "expired" && (
          <>
            <h1 className="text-xl font-bold text-text-primary">Code expiré</h1>
            <p className="text-sm text-text-muted">{errorMessage}</p>
            <p className="text-sm text-text-muted">Veuillez relancer le Companion pour générer un nouveau code.</p>
            <button onClick={() => handleLink()} className="mt-4 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-6 rounded-lg transition-colors">
              Réessayer
            </button>
          </>
        )}

        {linkState === "already-used" && (
          <>
            <h1 className="text-xl font-bold text-text-primary">Code déjà utilisé</h1>
            <p className="text-sm text-text-muted">{errorMessage}</p>
            <p className="text-sm text-text-muted">Votre Companion est déjà lié à un compte.</p>
          </>
        )}

        {linkState === "error" && (
          <>
            <h1 className="text-xl font-bold text-text-primary">Erreur</h1>
            <p className="text-sm text-text-muted">{errorMessage}</p>
            <button onClick={handleLink} className="mt-4 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-6 rounded-lg transition-colors">
              Réessayer
            </button>
          </>
        )}
      </div>
    </main>
  );
}
