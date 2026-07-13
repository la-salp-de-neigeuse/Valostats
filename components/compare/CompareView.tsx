"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import type { ComparisonData } from "@/services/comparison/types";

function formatPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

function formatNum(v: number, d = 2): string {
  return v.toFixed(d);
}

function resultColor(r: string): string {
  return r === "WIN" ? "bg-emerald-500" : r === "LOSS" ? "bg-accent" : "bg-slate-500";
}

function PlayerHeader({
  player,
  side,
}: {
  player: ComparisonData["player1"];
  side: "left" | "right";
}) {
  return (
    <div className={`text-center ${side === "right" ? "md:text-right" : "md:text-left"}`}>
      <h3 className="text-2xl font-bold text-white mb-1">{player.displayName}</h3>
      <div className={`flex items-center gap-2 justify-center ${side === "right" ? "md:justify-end" : "md:justify-start"}`}>
        <span className="px-2 py-1 bg-slate-800 rounded-md text-xs font-medium text-slate-300">
          {player.rank ?? "Non classé"}
        </span>
        <span className="text-sm text-slate-400">
          {player.matchCount} matchs
        </span>
      </div>
    </div>
  );
}

function StatRow({
  label,
  a,
  b,
  fmt,
  lowerIsBetter = false,
}: {
  label: string;
  a: number;
  b: number;
  fmt: (v: number) => string;
  lowerIsBetter?: boolean;
}) {
  let winner: "left" | "right" | null = null;
  if (a !== b) {
    if (lowerIsBetter) {
      winner = a < b ? "left" : "right";
    } else {
      winner = a > b ? "left" : "right";
    }
  }

  const leftWins = winner === "left";
  const rightWins = winner === "right";

  return (
    <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-slate-800/50 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2">
      <span className={`text-right font-semibold ${leftWins ? "text-emerald-400" : "text-slate-300"}`}>
        {fmt(a)}
      </span>
      <span className="text-center text-xs text-slate-500 uppercase tracking-wider font-medium">
        {label}
      </span>
      <span className={`font-semibold ${rightWins ? "text-emerald-400" : "text-slate-300"}`}>
        {fmt(b)}
      </span>
    </div>
  );
}

function StatsTable({ data }: { data: ComparisonData }) {
  const rows: Array<{ label: string; a: number; b: number; fmt: (v: number) => string; lowerIsBetter?: boolean }> = [
    { label: "Winrate", a: data.player1.winRate, b: data.player2.winRate, fmt: formatPct },
    { label: "K/D", a: data.player1.kda, b: data.player2.kda, fmt: (v) => formatNum(v) },
    { label: "ADR", a: data.player1.adr, b: data.player2.adr, fmt: (v) => formatNum(v, 1) },
    { label: "ACS", a: data.player1.acs, b: data.player2.acs, fmt: (v) => formatNum(v, 0) },
    { label: "Headshot", a: data.player1.headshotRate, b: data.player2.headshotRate, fmt: formatPct },
    { label: "First Death", a: data.player1.firstDeathRate, b: data.player2.firstDeathRate, fmt: formatPct, lowerIsBetter: true },
    { label: "Attaque (WR)", a: data.player1.attackWinRate, b: data.player2.attackWinRate, fmt: formatPct },
    { label: "Défense (WR)", a: data.player1.defenseWinRate, b: data.player2.defenseWinRate, fmt: formatPct },
    { label: "Utilitaire/Rd", a: data.player1.utilityPerRound, b: data.player2.utilityPerRound, fmt: (v) => formatNum(v) },
    { label: "Score IA", a: data.player1.aiScore ?? 0, b: data.player2.aiScore ?? 0, fmt: (v) => `${formatNum(v, 0)}/100` },
  ];

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        Face-à-Face
      </h3>
      <div className="space-y-1">
        {rows.map((r) => (
          <StatRow key={r.label} {...r} />
        ))}
      </div>
    </div>
  );
}

function RadarChartView({ data }: { data: ComparisonData }) {
  const chartData = [
    { metric: "Winrate", [data.player1.displayName]: data.player1.winRate, [data.player2.displayName]: data.player2.winRate },
    { metric: "K/D", [data.player1.displayName]: Math.min(data.player1.kda * 50, 100), [data.player2.displayName]: Math.min(data.player2.kda * 50, 100) },
    { metric: "ADR", [data.player1.displayName]: Math.min(data.player1.adr / 2, 100), [data.player2.displayName]: Math.min(data.player2.adr / 2, 100) },
    { metric: "ACS", [data.player1.displayName]: Math.min(data.player1.acs / 3, 100), [data.player2.displayName]: Math.min(data.player2.acs / 3, 100) },
    { metric: "HS%", [data.player1.displayName]: Math.min(data.player1.headshotRate * 2, 100), [data.player2.displayName]: Math.min(data.player2.headshotRate * 2, 100) },
    { metric: "Score IA", [data.player1.displayName]: data.player1.aiScore ?? 0, [data.player2.displayName]: data.player2.aiScore ?? 0 },
  ];

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polygon points="2 17 12 22 22 17"/><polygon points="2 12 12 17 22 12"/></svg>
        Profil Global
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#94A3B8", fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={data.player1.displayName}
            dataKey={data.player1.displayName}
            stroke="#FF4655"
            fill="#FF4655"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name={data.player2.displayName}
            dataKey={data.player2.displayName}
            stroke="#22d3ee"
            fill="#22d3ee"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip contentStyle={{ background: "#1c1c1f", border: "1px solid #27272a", borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AgentsBarChart({ data }: { data: ComparisonData }) {
  const allAgents = new Set<string>();
  data.player1.topAgents.forEach((a) => allAgents.add(a.name));
  data.player2.topAgents.forEach((a) => allAgents.add(a.name));

  const chartData = Array.from(allAgents).slice(0, 6).map((name) => {
    const a1 = data.player1.topAgents.find((a) => a.name === name);
    const a2 = data.player2.topAgents.find((a) => a.name === name);
    return {
      agent: name,
      [data.player1.displayName]: a1?.winRate ?? 0,
      [data.player2.displayName]: a2?.winRate ?? 0,
    };
  });

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        Winrate par Agent (%)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="agent" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "#27272a", opacity: 0.4 }}
            contentStyle={{ background: "#1c1c1f", border: "1px solid #27272a", borderRadius: 8, fontSize: 13 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(val: any) => [`${Number(val).toFixed(1)}%`, "Winrate"]}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey={data.player1.displayName} fill="#FF4655" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey={data.player2.displayName} fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MapsBarChart({ data }: { data: ComparisonData }) {
  const allMaps = new Set<string>();
  data.player1.topMaps.forEach((a) => allMaps.add(a.name));
  data.player2.topMaps.forEach((a) => allMaps.add(a.name));

  const chartData = Array.from(allMaps).slice(0, 6).map((name) => {
    const a1 = data.player1.topMaps.find((a) => a.name === name);
    const a2 = data.player2.topMaps.find((a) => a.name === name);
    return {
      map: name,
      [data.player1.displayName]: a1?.winRate ?? 0,
      [data.player2.displayName]: a2?.winRate ?? 0,
    };
  });

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
        Winrate par Map (%)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="map" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "#27272a", opacity: 0.4 }}
            contentStyle={{ background: "#1c1c1f", border: "1px solid #27272a", borderRadius: 8, fontSize: 13 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(val: any) => [`${Number(val).toFixed(1)}%`, "Winrate"]}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey={data.player1.displayName} fill="#FF4655" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey={data.player2.displayName} fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EvolutionLineChart({ data }: { data: ComparisonData }) {
  const p1Evo = data.player1.evolution || [];
  const p2Evo = data.player2.evolution || [];
  
  if (p1Evo.length === 0 && p2Evo.length === 0) {
    return (
      <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl text-center py-12">
        <p className="text-slate-400">{"Pas assez de données pour afficher l'évolution (Premium requis)."}</p>
      </div>
    );
  }

  const maxLen = Math.max(p1Evo.length, p2Evo.length);
  const chartData = Array.from({ length: maxLen }, (_, i) => {
    return {
      index: i + 1,
      [data.player1.displayName]: p1Evo[i]?.winRate ?? null,
      [data.player2.displayName]: p2Evo[i]?.winRate ?? null,
    };
  });

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        Évolution du Winrate (Historique réel)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="index" 
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            tickFormatter={(v) => `Période ${v}`}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            domain={['auto', 'auto']}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: "#1c1c1f", border: "1px solid #27272a", borderRadius: 8, fontSize: 13 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(val: any) => [`${val}%`, "Winrate"]}
            labelFormatter={(v) => `Période ${v}`}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line
            type="monotone"
            dataKey={data.player1.displayName}
            stroke="#FF4655"
            strokeWidth={3}
            dot={{ fill: "#0F1626", stroke: "#FF4655", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#FF4655" }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey={data.player2.displayName}
            stroke="#22d3ee"
            strokeWidth={3}
            dot={{ fill: "#111115", stroke: "#22d3ee", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#22d3ee" }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecentBar({ data }: { data: ComparisonData }) {
  const maxLen = Math.max(data.player1.recentResults.length, data.player2.recentResults.length);
  if (maxLen === 0) return null;

  const p1res = data.player1.recentResults.slice(0, 10);
  const p2res = data.player2.recentResults.slice(0, 10);

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl md:col-span-2">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        Historique des 10 derniers matchs
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm font-medium text-accent mb-3">{data.player1.displayName}</p>
          <div className="flex gap-2 flex-wrap">
            {p1res.map((r, i) => (
              <span key={`p1-${r}-${i}`} className={`w-8 h-8 rounded-md shadow-sm ${resultColor(r)} flex items-center justify-center text-xs font-bold text-white/90`} title={r}>
                {r === "WIN" ? "V" : r === "LOSS" ? "D" : "-"}
              </span>
            ))}
            {p1res.length === 0 && <span className="text-sm text-slate-600">Aucun historique</span>}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-cyan-400 mb-3">{data.player2.displayName}</p>
          <div className="flex gap-2 flex-wrap">
            {p2res.map((r, i) => (
              <span key={`p2-${r}-${i}`} className={`w-8 h-8 rounded-md shadow-sm ${resultColor(r)} flex items-center justify-center text-xs font-bold text-white/90`} title={r}>
                {r === "WIN" ? "V" : r === "LOSS" ? "D" : "-"}
              </span>
            ))}
            {p2res.length === 0 && <span className="text-sm text-slate-600">Aucun historique</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AiSummaryBox({ data }: { data: ComparisonData }) {
  const ai = data.aiSummary;
  
  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Z"/><path d="m12 8 4 4-4 4"/><path d="M8 12h8"/></svg>
      </div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.4 3 7.8 3 7.8v2.2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2.2s3-2.4 3-7.8a8 8 0 0 0-8-8z"/><path d="M9 21h6"/><path d="M10 11h4"/><path d="M12 9v4"/></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Analyse du Coach IA</h2>
          <p className="text-indigo-200/70 text-sm">{"Verdict et axes d'amélioration"}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Verdict Global</h4>
            <p className="text-white text-lg leading-relaxed">
              {ai.advantageTo === "PLAYER1" ? (
                <><span className="text-accent font-bold">{data.player1.displayName}</span> a un net avantage sur cette confrontation.</>
              ) : ai.advantageTo === "PLAYER2" ? (
                <><span className="text-cyan-400 font-bold">{data.player2.displayName}</span> a un net avantage sur cette confrontation.</>
              ) : (
                <span className="text-amber-400 font-bold">Un duel parfaitement équilibré sans avantage clair.</span>
              )}
            </p>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              {ai.areasForImprovement}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface/40 border border-accent/20 rounded-xl p-4">
              <h5 className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Forces de {data.player1.displayName}</h5>
              <ul className="space-y-2">
                {ai.player1Strengths.length > 0 ? ai.player1Strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2 items-start">
                    <span className="text-emerald-500 shrink-0 mt-0.5">✓</span> <span>{s}</span>
                  </li>
                )) : <li className="text-sm text-slate-500 italic">Aucune force majeure détectée</li>}
              </ul>
            </div>
            <div className="bg-surface/40 border border-cyan-500/20 rounded-xl p-4">
              <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Forces de {data.player2.displayName}</h5>
              <ul className="space-y-2">
                {ai.player2Strengths.length > 0 ? ai.player2Strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2 items-start">
                    <span className="text-emerald-500 shrink-0 mt-0.5">✓</span> <span>{s}</span>
                  </li>
                )) : <li className="text-sm text-slate-500 italic">Aucune force majeure détectée</li>}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center bg-surface/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Score de Qualité du Match</p>
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
                className={ai.globalScore > 80 ? "text-emerald-500" : ai.globalScore > 50 ? "text-amber-500" : "text-accent"}
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - Math.max(ai.globalScore, 1) / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{ai.globalScore}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Basé sur le niveau combiné des deux joueurs
          </p>
        </div>
      </div>
    </div>
  );
}

export function CompareView({ data }: { data: ComparisonData }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="bg-surface border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800/20 font-black text-[12rem] italic pointer-events-none select-none">
          VS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
          <PlayerHeader player={data.player1} side="left" />
          <div className="hidden md:flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-4 border-[#0a0a0c] shadow-xl">
              <span className="text-sm font-bold text-slate-400">VS</span>
            </div>
          </div>
          <PlayerHeader player={data.player2} side="right" />
        </div>
      </div>

      {/* AI COACH SUMMARY */}
      <AiSummaryBox data={data} />

      {/* CHARTS GRID 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RadarChartView data={data} />
        <StatsTable data={data} />
      </div>

      {/* CHARTS GRID 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AgentsBarChart data={data} />
        <MapsBarChart data={data} />
      </div>

      {/* EVOLUTION TIMELINE & RECENT */}
      <EvolutionLineChart data={data} />
      <RecentBar data={data} />

    </div>
  );
}

