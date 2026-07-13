"use client";

import type { PerformanceAiInsights } from "@/services/performance/types";

interface AiInsightsPanelProps {
  insights: PerformanceAiInsights;
}

export function AiInsightsPanel({ insights }: AiInsightsPanelProps) {
  if (!insights.score && !insights.summary && insights.strengths.length === 0 && insights.weaknesses.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-accent-light rounded-xl text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Résumé IA</h3>
          <p className="text-xs text-slate-500">Analyse automatique de vos performances</p>
        </div>
        {insights.score !== null && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{insights.score}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
        )}
      </div>

      {insights.summary && (
        <div className="bg-surface/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-slate-300 leading-relaxed">{insights.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.strengths.length > 0 && (
          <div className="bg-surface/40 border border-emerald-500/20 rounded-xl p-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Forces</h4>
            <ul className="space-y-2">
              {insights.strengths.map((s, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2 items-start">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {insights.weaknesses.length > 0 && (
          <div className="bg-surface/40 border border-accent/20 rounded-xl p-4">
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-3">{"Axes d'amélioration"}</h4>
            <ul className="space-y-2">
              {insights.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2 items-start">
                  <span className="text-accent shrink-0 mt-0.5">!</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

