"use client";

interface LimitDialogProps {
  open: boolean;
  limit: number;
  onClose: () => void;
}

export function LimitDialog({ open, limit, onClose }: LimitDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-text-primary mb-2">Limite atteinte</h2>
        <p className="text-sm text-text-secondary mb-6">
          Vous avez atteint la limite de {limit} presets. Passez au plan PRO pour créer jusqu&apos;à 10 presets.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
