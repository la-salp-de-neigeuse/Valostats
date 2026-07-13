"use client";

import { useState, useCallback } from "react";
import type { FeedbackType } from "@/services/feedback/types";
import { FEEDBACK_TYPE_LABELS, FEEDBACK_TYPE_EMOJIS } from "@/services/feedback/types";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>("BUG");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          pageUrl: window.location.href,
          browser: navigator.userAgent,
          operatingSystem: navigator.platform,
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setType("BUG");
        setTitle("");
        setDescription("");
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setSending(false);
    }
  }, [type, title, description, onClose]);

  if (!isOpen) return null;

  const types: FeedbackType[] = ["BUG", "IDEA", "SUGGESTION", "POSITIVE"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {success ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2">Merci pour votre feedback !</h3>
            <p className="text-slate-400">Votre retour nous aide à améliorer ValoStats.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">💬 Envoyer un feedback</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors" aria-label="Fermer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        type === t
                          ? "border-accent/50 bg-accent-light text-accent"
                          : "border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {FEEDBACK_TYPE_EMOJIS[t]} {FEEDBACK_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="feedback-title" className="block text-sm font-medium text-slate-300 mb-2">Titre</label>
                <input
                  id="feedback-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Résumez votre feedback en quelques mots"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                  minLength={3}
                  maxLength={200}
                />
              </div>

              <div>
                <label htmlFor="feedback-description" className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez en détail votre retour..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  required
                  minLength={10}
                  maxLength={5000}
                />
                <p className="text-xs text-slate-500 mt-1 text-right">{description.length}/5000</p>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-800/50 border border-slate-700 rounded-lg hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sending || title.trim().length < 3 || description.trim().length < 10}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-brand rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? "Envoi en cours..." : "Envoyer"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
