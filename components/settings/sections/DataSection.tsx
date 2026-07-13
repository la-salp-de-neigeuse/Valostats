"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function DataSection() {
  const { addToast } = useToast();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export-data");
      if (!res.ok) throw new Error("Erreur lors de l'exportation.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `valostats-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast({ variant: "success", title: "Données exportées." });
    } catch {
      addToast({ variant: "error", title: "Erreur", description: "Impossible d'exporter vos données. Réessayez plus tard." });
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Téléchargement des données</h2>
        <p className="text-sm text-text-muted">{"Exportez l'ensemble de vos données personnelles conformément au RGPD."}</p>
      </div>

      <div className="p-4 rounded-xl bg-surface-hover/20 border border-border space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center text-accent shrink-0 mt-0.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Export JSON</p>
            <p className="text-xs text-text-muted mt-1">
              Vous recevrez un fichier contenant vos informations de profil, préférences, statistiques et historique.
            </p>
          </div>
        </div>

        <Button onClick={handleExport} isLoading={exporting}>
          Télécharger mes données
        </Button>
      </div>
    </Card>
  );
}

