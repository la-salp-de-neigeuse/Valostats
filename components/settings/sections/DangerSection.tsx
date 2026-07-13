"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/settings/ConfirmDialog";

export function DangerSection() {
  const { addToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setPassword("");
    setConfirmation("");
    setError(null);
    setShowConfirm(true);
  }

  async function handleDelete() {
    setError(null);

    if (confirmation !== "SUPPRIMER") {
      setError("Veuillez taper SUPPRIMER pour confirmer.");
      return;
    }

    if (!password) {
      setError("Votre mot de passe est requis.");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la suppression.");
      }

      addToast({ variant: "success", title: "Compte supprimé." });
      window.location.href = "/";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inattendue.";
      setError(msg);
      addToast({ variant: "error", title: "Erreur", description: msg });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card padding="lg" className="border-red-500/30">
        <div className="space-y-2 mb-6">
          <h2 className="text-lg font-semibold text-red-400">Suppression du compte</h2>
          <p className="text-sm text-text-muted">Cette action est irréversible. Toutes vos données seront définitivement supprimées.</p>
        </div>

        <Button variant="danger" onClick={handleOpen}>
          Supprimer mon compte
        </Button>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer le compte"
        description="Cette action est irréversible. Toutes vos données, statistiques et abonnements seront définitivement supprimés."
        confirmLabel="Supprimer définitivement"
        loading={deleting}
      >
        <div className="space-y-4">
          <FieldGroup label="Mot de passe">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              autoComplete="current-password"
            />
          </FieldGroup>
          <FieldGroup label='Tapez "SUPPRIMER" pour confirmer'>
            <Input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="SUPPRIMER"
            />
          </FieldGroup>
          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        </div>
      </ConfirmDialog>
    </>
  );
}
