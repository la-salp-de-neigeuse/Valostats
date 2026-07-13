"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

export function useSettingSave<T>({
  endpoint,
  method = "PUT",
  initialData,
  transformPayload,
  successMessage = "Modifications enregistrées.",
}: {
  endpoint: string;
  method?: string;
  initialData: T;
  transformPayload?: (data: T) => Record<string, unknown>;
  successMessage?: string;
}) {
  const { addToast } = useToast();
  const [data, setData] = useState<T>(initialData);
  const [lastSaved, setLastSaved] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanges = JSON.stringify(data) !== JSON.stringify(lastSaved);

  const save = useCallback(async () => {
    if (!hasChanges) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = transformPayload ? transformPayload(data) : data;
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la sauvegarde.");
      }

      setLastSaved(data);
      setSuccess(true);
      addToast({ variant: "success", title: successMessage });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inattendue.";
      setError(msg);
      addToast({ variant: "error", title: "Erreur", description: msg });
    } finally {
      setSaving(false);
    }
  }, [data, hasChanges, endpoint, method, transformPayload, successMessage, addToast]);

  const reset = useCallback(() => {
    setData(initialData);
    setLastSaved(initialData);
    setError(null);
    setSuccess(false);
  }, [initialData]);

  return { data, setData, hasChanges, saving, save, error, success, reset };
}
