"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VerifyState = "idle" | "loading" | "success" | "error";

export function VerifyRiotButton() {
  const [state, setState] = useState<VerifyState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleVerify() {
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/riot/verify", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Une erreur est survenue");
        setState("error");
        return;
      }

      setState("success");
      router.refresh();
    } catch {
      setErrorMsg("Impossible de contacter le serveur.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <span className="flex items-center gap-2 text-sm font-medium text-emerald-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        Compte vérifié !
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        id="verify-riot-account-btn"
        onClick={handleVerify}
        disabled={state === "loading"}
        className="flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "loading" ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Vérification en cours…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            Vérifier avec Riot Games
          </>
        )}
      </button>
      {state === "error" && (
        <p className="text-xs text-rose-400 leading-relaxed">{errorMsg}</p>
      )}
    </div>
  );
}
