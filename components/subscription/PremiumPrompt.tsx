import { UpgradeButton } from "@/components/subscription/UpgradeButton";

interface PremiumPromptProps {
  title?: string;
  description?: string;
}

export function PremiumPrompt({
  title = "Fonctionnalité Premium",
  description = "Passez à Premium pour débloquer les graphiques d'évolution, l'historique complet et les analyses IA illimitées.",
}: PremiumPromptProps) {
  return (
    <div className="bg-gradient-to-br from-rose-500/5 to-transparent border border-rose-500/20 rounded-2xl p-6 text-center">
      <div className="p-3 bg-rose-500/10 rounded-xl inline-flex mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">{description}</p>
      <UpgradeButton className="inline-flex bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-rose-500/20" />

    </div>
  );
}
