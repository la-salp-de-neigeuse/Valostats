"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AccountSectionProps {
  email: string;
  plan: string;
  role: string;
  createdAt: Date;
  hasRiotAccount: boolean;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-text-primary font-medium">{value}</span>
    </div>
  );
}

export function AccountSection({ email, plan, role, createdAt, hasRiotAccount }: AccountSectionProps) {
  const planLabel = plan === "PREMIUM" ? "Premium" : "Gratuit";
  const planVariant = plan === "PREMIUM" ? "premium" : "default";

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Compte</h2>
        <p className="text-sm text-text-muted">Informations générales de votre compte.</p>
      </div>

      <div className="divide-y divide-border">
        <InfoRow label="Email" value={email} />
        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-sm text-text-muted">Plan</span>
          <Badge variant={planVariant}>{planLabel}</Badge>
        </div>
        <InfoRow label="Rôle" value={role === "ADMIN" ? "Administrateur" : "Utilisateur"} />
        <InfoRow label="Membre depuis" value={new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(createdAt))} />
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <span className="text-sm text-text-muted">Compte Riot</span>
          <Badge variant={hasRiotAccount ? "success" : "default"}>
            {hasRiotAccount ? "Lié" : "Non lié"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
