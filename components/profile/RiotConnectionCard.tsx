"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SafeRiotAccount } from "@/services/riot-account/riot-account-service";
import { LinkRiotForm } from "./LinkRiotForm";
import { SyncMatchesButton } from "./SyncMatchesButton";
import { VerifyRiotButton } from "./VerifyRiotButton";

export function RiotConnectionCard({ account }: { account: SafeRiotAccount | null }) {
  const [showForm, setShowForm] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const router = useRouter();

  async function handleUnlink() {
    if (!window.confirm("Êtes-vous sûr de vouloir délire votre compte Riot ? Cette action est irréversible.")) {
      return;
    }

    setUnlinking(true);
    try {
      const res = await fetch("/api/riot/unlink", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Une erreur est survenue");
        return;
      }
      router.refresh();
    } catch {
      alert("Impossible de contacter le serveur.");
    } finally {
      setUnlinking(false);
    }
  }

  return (
    <div className="bg-[#111115] border border-slate-800 rounded-3xl p-8 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Connexion Riot Games</h2>
        {account && !showForm && (
          account.isVerified ? (
            <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full border border-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              Vérifié
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-semibold rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true"></span>
              Non vérifié
            </span>
          )
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {showForm ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-bold text-white mb-2">
              {account ? "Mettre à jour le compte" : "Lier votre compte"}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Saisissez votre Riot ID complet pour lier votre compte Valorant.
            </p>
            <LinkRiotForm 
              onCancel={() => setShowForm(false)} 
              onSuccess={() => setShowForm(false)} 
            />
          </div>
        ) : account ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">{account.gameName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {account.gameName} <span className="text-slate-500">#{account.tagLine}</span>
                </p>
                <p className="text-sm text-slate-400">Région : {account.regionGroup}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-500">Rang Actuel</label>
              <p className="text-lg text-slate-200 mt-1">{account.currentRank || "Non Classé"}</p>
            </div>

            {!account.isVerified && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-400 mb-2">
                  Ce compte n&apos;a pas encore été vérifié auprès de Riot Games.
                </p>
                <VerifyRiotButton />
              </div>
            )}

            {account.isVerified && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <p className="text-xs text-emerald-400 mb-2">
                  Importez vos matchs Valorant depuis l&apos;API Riot.
                </p>
                <SyncMatchesButton lastSyncAt={account.lastSyncAt} />
              </div>
            )}
            
            <div className="pt-2 flex gap-4">
              <button 
                onClick={() => setShowForm(true)}
                className="text-sm text-slate-400 hover:text-white font-medium transition-colors"
              >
                Mettre à jour
              </button>
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="text-sm text-rose-500 hover:text-rose-400 font-medium transition-colors disabled:opacity-50"
              >
                {unlinking ? "Déliaison..." : "Délier le compte"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              </svg>
            </div>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Liez votre compte Riot Games pour analyser vos matchs et obtenir votre score IA personnalisé.
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-rose-500/20 w-full sm:w-auto"
            >
              Lier mon compte Riot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

