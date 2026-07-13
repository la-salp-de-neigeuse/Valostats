"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

type SyncState = "idle" | "loading" | "success" | "error";

interface SyncResult {
  matchIdsFound: number;
  matchesInserted: number;
  playerStatsInserted: number;
  skippedDuplicates: number;
  errors: string[];
}

export function SyncMatchesButton({ lastSyncAt }: { lastSyncAt: Date | null }) {
  const [state, setState] = useState<SyncState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const router = useRouter();
  const { addToast } = useToast();

  async function handleSync() {
    setState("loading");
    setErrorMsg("");
    setSyncResult(null);

    try {
      const res = await fetch("/api/riot/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Une erreur est survenue");
        setState("error");
        addToast({ variant: "error", title: "Sync échouée", description: data.error || "Une erreur est survenue" });
        return;
      }

      setSyncResult(data.result);
      setState("success");
      addToast({
        variant: "success",
        title: "Synchronisation terminée",
        description: `${data.result.matchesInserted} match(s) importé(s), ${data.result.playerStatsInserted} stat(s) enregistrée(s)`,
      });
      router.refresh();
    } catch {
      setErrorMsg("Impossible de contacter le serveur.");
      setState("error");
      addToast({ variant: "error", title: "Sync échouée", description: "Impossible de contacter le serveur." });
    }
  }

  const formattedLastSync = lastSyncAt
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(lastSyncAt))
    : null;

  return (
    <div className="flex flex-col gap-2">
      {formattedLastSync && (
        <p className="text-xs text-slate-500">
          Dernière sync : {formattedLastSync}
        </p>
      )}

      <button
        id="sync-matches-btn"
        onClick={handleSync}
        disabled={state === "loading"}
        className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "loading" ? (
          <>
            <Spinner size="sm" />
            Synchronisation en cours…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
            Synchroniser les matchs
          </>
        )}
      </button>

      {state === "success" && syncResult && (
        <p className="text-xs text-emerald-400/70 leading-relaxed animate-fade-in">
          {syncResult.matchesInserted} match(s) importé(s), {syncResult.playerStatsInserted} stat(s) enregistrée(s)
          {syncResult.skippedDuplicates > 0 && ` (${syncResult.skippedDuplicates} déjà présents)`}.
        </p>
      )}

      {state === "error" && (
        <p className="text-xs text-accent/70 leading-relaxed animate-fade-in">{errorMsg}</p>
      )}
    </div>
  );
}
