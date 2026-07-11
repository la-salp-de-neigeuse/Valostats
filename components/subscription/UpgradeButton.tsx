"use client";

import { useCallback, useState } from "react";

interface UpgradeButtonProps {
  className?: string;
  label?: string;
}

export function UpgradeButton({ className = "", label = "Upgrade" }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={className}
    >
      {loading ? "Chargement..." : label}
    </button>
  );
}
