"use client";

import { useState } from "react";
import { FeedbackModal } from "./FeedbackModal";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg transition-colors"
        aria-label="Envoyer un feedback"
      >
        <span>💬</span>
        <span className="hidden sm:inline">Feedback</span>
      </button>
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
