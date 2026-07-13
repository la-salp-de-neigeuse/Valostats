"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { PredictionResult, InfluencingFactor } from "@/services/prediction/types";

function formatTier(tier: number): string {
  const ranks = [
    { min: 0, label: "Fer" }, { min: 3, label: "Bronze" }, { min: 6, label: "Argent" },
    { min: 9, label: "Or" }, { min: 12, label: "Platine" }, { min: 15, label: "Diamant" },
    { min: 18, label: "Asc." }, { min: 21, label: "Imm." }, { min: 24, label: "Radiant" },
  ];
  for (const r of ranks) {
    if (tier >= r.min && tier < r.min + 3) {
      const pos = tier - r.min + 1;
      return `${r.label} ${pos}`;
    }
  }
  if (tier >= 24) return "Radiant";
  return `Tier ${tier}`;
}

function PredictionCard({
  label,
  value,
  subtitle,
  icon,
  accent,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
        {icon && <div className="text-slate-600 group-hover:text-slate-400 transition-colors">{icon}</div>}
      </div>
      <div className={`text-3xl font-black tracking-tight ${accent ? "text-transparent bg-clip-text bg-gradient-brand" : "text-white"}`}>
        {value}
      </div>
      {subtitle && <div className="text-sm text-slate-400 mt-2 font-medium">{subtitle}</div>}
    </div>
  );
}

function CircularScore({ score, label, subtitle }: { score: number; label: string; subtitle?: string }) {
  const color = score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-accent";
  return (
    <div className="flex flex-col items-center justify-center bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{label}</h3>
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
          <circle 
            cx="64" 
            cy="64" 
            r="56" 
            stroke="currentColor" 
            strokeWidth="8" 
            fill="transparent" 
            className={color}
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - Math.max(score, 1) / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white">{score}</span>
          <span className="text-xs text-slate-500 font-bold uppercase mt-1">/ 100</span>
        </div>
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-4 text-center max-w-[200px]">{subtitle}</p>}
    </div>
  );
}

function FactorBadge({ factor }: { factor: InfluencingFactor }) {
  const isPos = factor.impact === "positive";
  const isNeg = factor.impact === "negative";
  
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${isPos ? "bg-emerald-500/10 border-emerald-500/20" : isNeg ? "bg-accent-light border-accent/20" : "bg-slate-800/50 border-slate-700"}`}>
      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isPos ? "bg-emerald-500/20 text-emerald-400" : isNeg ? "bg-accent/20 text-accent" : "bg-slate-700 text-slate-400"}`}>
        {isPos ? "↑" : isNeg ? "↓" : "−"}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-bold ${isPos ? "text-emerald-400" : isNeg ? "text-accent" : "text-slate-300"}`}>
            {factor.name}
          </span>
          <span className="text-xs text-slate-500 font-medium px-1.5 py-0.5 bg-black/20 rounded">
            {typeof factor.value === 'number' ? factor.value.toFixed(1) : factor.value}
          </span>
        </div>
        <p className="text-sm text-slate-300">{factor.description}</p>
      </div>
    </div>
  );
}

function RankChart({ data }: { data: PredictionResult }) {
  const chartData = data.progressionCurve
    .filter((p) => p.matchIndex % 5 === 0 || p.actualRankTier !== null)
    .map((p) => ({
      match: `#${p.matchIndex}`,
      Réel: p.actualRankTier,
      Projeté: p.projectedRankTier,
    }));

  const currentLine = data.currentRankTier;

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        Courbe de progression estimée
      </h3>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="match" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
          <YAxis
            domain={[Math.max(0, currentLine - 3), Math.max(currentLine + 5, data.nextRankTier + 1)]}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            tickFormatter={formatTier}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: "#1c1c1f", border: "1px solid #27272a", borderRadius: 8, fontSize: 13 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [value !== null && value !== undefined ? formatTier(Number(value)) : "—", name]}
          />
          <ReferenceLine y={currentLine} stroke="#FF4655" strokeDasharray="4 4" label={{ value: "Rang Actuel", position: "insideTopLeft", fill: "#FF4655", fontSize: 12, fontWeight: 'bold' }} />
          <ReferenceLine y={data.nextRankTier} stroke="#22d3ee" strokeDasharray="4 4" label={{ value: "Prochain Rang", position: "insideTopLeft", fill: "#22d3ee", fontSize: 12, fontWeight: 'bold' }} />
          <Line
            type="monotone"
            dataKey="Réel"
            stroke="#FF4655"
            strokeWidth={3}
            dot={{ r: 3, fill: "#FF4655", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Projeté"
            stroke="#22d3ee"
            strokeWidth={3}
            strokeDasharray="6 6"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AiCoachAdvice({ data }: { data: PredictionResult }) {
  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Z"/><path d="m12 8 4 4-4 4"/><path d="M8 12h8"/></svg>
      </div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.4 3 7.8 3 7.8v2.2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2.2s3-2.4 3-7.8a8 8 0 0 0-8-8z"/><path d="M9 21h6"/><path d="M10 11h4"/><path d="M12 9v4"/></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Analyse Prédictive IA</h2>
          <p className="text-indigo-200/70 text-sm">Basé sur le moteur de prédiction pondéré</p>
        </div>
      </div>
      
      <div className="relative z-10 space-y-6">
        <div className="bg-surface/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Verdict Global</h4>
          <p className="text-white text-lg leading-relaxed">
            {data.summary}
          </p>
        </div>
        
        <div className="bg-surface/40 border border-indigo-500/20 rounded-2xl p-5">
          <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">Conseils personnalisés pour le Rank Up</h5>
          <ul className="space-y-3">
            {data.advice.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function PredictionView({ data }: { data: PredictionResult }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* LIGNE 1 : SCORES GLOBAUX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CircularScore 
          score={data.globalProgressionScore} 
          label="Score de Progression" 
          subtitle="Pondération globale de vos performances et tendances récentes."
        />
        <CircularScore 
          score={data.probability} 
          label="Probabilité Rank Up" 
          subtitle={`Chance d'atteindre le rang ${data.nextRankLabel} dans un futur proche.`}
        />
        <CircularScore 
          score={data.winProbability} 
          label="Chance de Victoire" 
          subtitle="Probabilité estimée de remporter votre prochain match classé."
        />
      </div>

      {/* LIGNE 2 : METRICS & STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PredictionCard
          label="Rang Visé"
          value={data.nextRankLabel}
          subtitle={`Actuellement : ${data.currentRankLabel}`}
          accent
        />
        <PredictionCard
          label="Matchs Estimés"
          value={data.estimatedMatches < Infinity ? `${data.estimatedMatches}` : "—"}
          subtitle="Avant promotion"
        />
        <PredictionCard
          label="Temps de Jeu"
          value={data.estimatedTimeHours < Infinity ? `${data.estimatedTimeHours}h` : "—"}
          subtitle="Heures estimées"
        />
        <PredictionCard
          label="RR Projeté"
          value={data.estimatedRR ? `${data.estimatedRR}` : "—"}
          subtitle="Score MMR Interne"
        />
      </div>

      {/* LIGNE 3 : FACTEURS D'INFLUENCE & AI COACH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">{"Facteurs d'Influence"}</h3>
          <div className="space-y-3">
            {data.influencingFactors.length > 0 ? (
              data.influencingFactors.map((f, i) => (
                <FactorBadge key={i} factor={f} />
              ))
            ) : (
              <div className="p-6 text-center border border-slate-800 rounded-2xl bg-surface">
                <p className="text-slate-500 text-sm">Pas assez de données marquantes.</p>
              </div>
            )}
            
            {/* STREAKS MINI-CARD */}
            <div className="p-4 border border-slate-800 rounded-2xl bg-surface mt-6">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Séries Actuelles</h4>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-emerald-400">{data.streaks.winStreak} Victoires</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-sm font-medium text-accent">{data.streaks.lossStreak} Défaites</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <AiCoachAdvice data={data} />
        </div>
      </div>

      {/* LIGNE 4 : COURBE DE PROGRESSION */}
      <RankChart data={data} />

    </div>
  );
}

