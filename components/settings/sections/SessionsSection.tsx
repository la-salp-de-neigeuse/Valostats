"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  createdAt: string;
  isCurrent: boolean;
}

function getDeviceIcon(device: string) {
  if (device.toLowerCase().includes("windows") || device.toLowerCase().includes("pc")) return "🖥️";
  if (device.toLowerCase().includes("mac")) return "💻";
  if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("android")) return "📱";
  if (device.toLowerCase().includes("linux")) return "🐧";
  return "🌐";
}

export function SessionsSection() {
  const { addToast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/user/sessions");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (mounted) setSessions(data.sessions ?? []);
      } catch {
        if (mounted) setSessions([
          { id: "current", device: navigator.platform || "Inconnu", browser: "Navigateur actuel", ip: "...", createdAt: new Date().toISOString(), isCurrent: true },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function revokeSession(id: string) {
    setRevokingId(id);
    try {
      const res = await fetch(`/api/user/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSessions((prev) => prev.filter((s) => s.id !== id));
      addToast({ variant: "success", title: "Session révoquée." });
    } catch {
      addToast({ variant: "error", title: "Erreur", description: "Impossible de révoquer cette session." });
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Sessions actives</h2>
        <p className="text-sm text-text-muted">Consultez et gérez vos sessions actives.</p>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Chargement des sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-text-muted">Aucune session active.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover/20 border border-border">
              <span className="text-2xl">{getDeviceIcon(session.device)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary truncate">{session.device}</p>
                  {session.isCurrent && <Badge variant="success" size="sm">Actuelle</Badge>}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {session.browser} &middot; {session.ip} &middot; {new Date(session.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={revokingId === session.id}
                  onClick={() => revokeSession(session.id)}
                >
                  Révoquer
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
