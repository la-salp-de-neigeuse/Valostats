"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function SecuritySection() {
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors du changement de mot de passe.");
      }

      addToast({ variant: "success", title: "Mot de passe modifié avec succès." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inattendue.";
      setError(msg);
      addToast({ variant: "error", title: "Erreur", description: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Sécurité</h2>
        <p className="text-sm text-text-muted">Gérez votre mot de passe et la sécurité de votre compte.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <FieldGroup label="Mot de passe actuel">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Votre mot de passe actuel"
            autoComplete="current-password"
          />
        </FieldGroup>

        <FieldGroup label="Nouveau mot de passe">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 caractères"
            autoComplete="new-password"
          />
        </FieldGroup>

        <FieldGroup label="Confirmer le mot de passe">
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmez le nouveau mot de passe"
            autoComplete="new-password"
          />
        </FieldGroup>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

        <Button type="submit" isLoading={saving} disabled={!currentPassword || !newPassword || !confirmPassword}>
          Modifier le mot de passe
        </Button>
      </form>
    </Card>
  );
}
